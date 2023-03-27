import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendVerificationEmailEvent, UserUpdatedEmailEvent } from '../events';
import { VerificationService } from './verification.service';

export type SendToUser = { id: string, email: string }

@Injectable()
export class VerificationListener {
  private logger = new Logger(VerificationListener.name);

  constructor(private verificationService: VerificationService) {
  }

  @OnEvent(SendVerificationEmailEvent)
  async handleSendVerificationEmailEvent(user: SendToUser) {
    try {
      await this.verificationService.sendVerificationEmail({ user });
    } catch (e) {
      this.logger.warn(`Failed to send verification email: ${e}`);
    }
  }

  @OnEvent(UserUpdatedEmailEvent)
  async handleUserChangeEmailEvent(user: SendToUser) {
    try {
      await this.verificationService.sendVerificationEmail({ user, hasChangedEmail: true });
    } catch (e) {
      this.logger.warn(`Failed to send verification email after change: ${e}`);
    }
  }
}
