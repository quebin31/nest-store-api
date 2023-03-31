import { Module } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import { VerificationService } from './verification.service';
import { EmailModule } from '../../shared/email/email.module';
import { VerificationListener } from './verification.listener';
import { SharedUsersModule } from '../../shared/users/users.module';

@Module({
  imports: [SharedUsersModule, EmailModule],
  providers: [
    VerificationRepository,
    VerificationService,
    VerificationListener,
  ],
  exports: [VerificationService],
})
export class VerificationModule {
}
