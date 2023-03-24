import { Module } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import { VerificationService } from './verification.service';
import { EmailModule } from '../email/email.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [EmailModule, UsersModule],
  providers: [VerificationRepository, VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {
}
