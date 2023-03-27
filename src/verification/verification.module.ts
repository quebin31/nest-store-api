import { Module } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import { VerificationService } from './verification.service';
import { EmailModule } from '../email/email.module';
import { VerificationListener } from './verification.listener';

@Module({
  imports: [EmailModule],
  providers: [VerificationRepository, VerificationService, VerificationListener],
  exports: [VerificationService],
})
export class VerificationModule {
}
