import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { SendVerificationOptions } from '../auth/auth.service';
import { VerificationRepository } from './verification.repository';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class VerificationService {
  constructor(
    private verificationRepository: VerificationRepository,
    private usersService: UsersService,
    private emailService: EmailService,
  ) {
  }

  async sendVerificationEmail(options: SendVerificationOptions) {
    const { id, email: maybeEmail } = options;

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
      const httpCode = HttpStatus.TOO_MANY_REQUESTS;
      const error = 'Email verifications can only be sent every 60 seconds';
      throw new HttpException(error, httpCode);
    }

    const code = await this.verificationRepository.createVerificationCodeFor(id);
    await this.verificationRepository.saveRequestedAtFor(id);
    await this.emailService.sendVerificationCode(resolvedEmail, code);
  }
}
