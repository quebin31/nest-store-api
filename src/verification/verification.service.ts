import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import { EmailService } from '../email/email.service';
import { TooManyRequestsException } from '../errors';
import { UsersRepository } from '../users/users.repository';
import { pick } from '../utils/types';

export type SendVerificationOptions = { id: string, email?: string }

@Injectable()
export class VerificationService {
  constructor(
    private verificationRepository: VerificationRepository,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {
  }

  async isUserVerified(id: string) {
    let isVerified = await this.verificationRepository.getIsVerifiedFor(id);
    if (isVerified !== null) return isVerified;

    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User does not exist');
    }

    isVerified = user.verifiedAt !== null;
    await this.verificationRepository.setIsVerifiedFor(user.id, isVerified);
    return isVerified;
  }

  async sendVerificationEmail(options: SendVerificationOptions) {
    const { id, email: maybeEmail } = options;
    if (await this.isUserVerified(id)) {
      throw new BadRequestException('User is already verified');
    }

    let resolvedEmail: string;
    if (maybeEmail !== undefined) {
      resolvedEmail = maybeEmail;
    } else {
      const user = await this.usersRepository.findById(id);
      if (!user) {
        throw new NotFoundException(`Couldn't find user to send email to`);
      }

      resolvedEmail = user.email;
    }

    const requestedAt = await this.verificationRepository.getRequestedAtFor(id);
    if (requestedAt !== null && requestedAt + 60 * 1000 > Date.now()) {
      throw new TooManyRequestsException('Email verifications can only be sent every 60 seconds');
    }

    const code = await this.verificationRepository.createVerificationCodeFor(id);
    await this.emailService.sendVerificationCode(resolvedEmail, code);
  }

  async verifyUserEmail(id: string, code: string) {
    const savedCode = await this.verificationRepository.getVerificationCodeFor(id);
    if (savedCode === null) {
      throw new NotFoundException(`Couldn't find an active verification process`);
    }

    if (code !== savedCode) {
      throw new BadRequestException('Received an invalid verification code');
    }

    const user = await this.verificationRepository.updateUser(id, { isVerified: true })
      .catch((_) => {
        throw new NotFoundException(`User to verify doesn't exist`);
      });

    return {
      ...pick(user, ['name', 'email', 'role', 'verifiedAt']),
      verified: user.verifiedAt !== null,
    };
  }
}
