import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter } from 'eventemitter3';
import { ModuleRef } from '@nestjs/core';
import { AuthService, SendVerificationOptions } from '../auth/auth.service';

export const SendVerificationEmailEvent = Symbol('send_verification_email_event');

@Injectable()
export class EventsService implements OnModuleInit {
  private eventEmitter = new EventEmitter();
  private logger = new Logger(EventsService.name);
  private authService!: AuthService;

  constructor(private moduleRef: ModuleRef) {
  }

  async onModuleInit() {
    this.authService = this.moduleRef.get(AuthService, { strict: false });
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
      await this.authService.sendVerificationEmail(options);
    } catch (e) {
      this.logger.warn(`Failed to send verification email ${e}`);
    }
  }
}
