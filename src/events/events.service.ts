import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'eventemitter3';
import { ModuleRef } from '@nestjs/core';
import { SendVerificationOptions } from '../auth/auth.service';
import { VerificationService } from '../verification/verification.service';

export const SendVerificationEmailEvent = Symbol('send_verification_email_event');

@Injectable()
export class EventsService implements OnModuleInit {
  private eventEmitter = new EventEmitter();
  private logger = new Logger(EventsService.name);
  private verificationService!: VerificationService;

  constructor(private moduleRef: ModuleRef) {
  }

  async onModuleInit() {
    this.verificationService = this.moduleRef.get(VerificationService, { strict: false });
    this.registerSendVerificationEmailHandler();
  }

  private registerSendVerificationEmailHandler() {
    const boundHandler = this.handleSendVerificationEmail.bind(this);
    this.eventEmitter.on(SendVerificationEmailEvent, boundHandler);
  }

  emitSendVerificationEmailEvent(options: SendVerificationOptions) {
    this.eventEmitter.emit(SendVerificationEmailEvent, options);
  }

  private async handleSendVerificationEmail(options: SendVerificationOptions) {
    try {
      await this.verificationService.sendVerificationEmail(options);
    } catch (e) {
      this.logger.warn(`Failed to send verification email ${e}`);
    }
  }
}
