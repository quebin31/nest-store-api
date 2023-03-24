import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SendVerificationOptions } from '../auth/auth.service';
import { VerificationRepository } from './verification.repository';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { TooManyRequestsException } from '../errors';

@Injectable()
export class VerificationService {
  constructor(
    private verificationRepository: VerificationRepository,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {
  }

  async isUserVerified(id: string) {
    let isVerified = await this.verificationRepository.getIsVerifiedFor(id);
    if (isVerified !== null) return isVerified;

    const user = await this.usersService.findById(id);
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
      const user = await this.usersService.findById(id);
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
    await this.verificationRepository.setRequestedAtFor(id);
    await this.emailService.sendVerificationCode(resolvedEmail, code);
  }
}
