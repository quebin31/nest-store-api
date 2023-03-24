import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendVerificationEmailEvent } from '../events';
import { SendVerificationOptions, VerificationService } from './verification.service';

@Injectable()
export class VerificationListener {
  private logger = new Logger(VerificationListener.name);

  constructor(private verificationService: VerificationService) {
  }

  @OnEvent(SendVerificationEmailEvent)
  async handleSendVerificationEmailEvent(options: SendVerificationOptions) {
    try {
      await this.verificationService.sendVerificationEmail(options);
    } catch (e) {
      this.logger.warn(`Failed to send verification email ${e}`);
    }
  }
}
