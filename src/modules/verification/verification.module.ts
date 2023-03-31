import { Module } from '@nestjs/common';
import { VerificationRepository } from './verification.repository';
import { VerificationService } from './verification.service';
import { EmailModule } from '../../shared/email/email.module';
import { VerificationListener } from './verification.listener';
import { RepositoriesModule } from '../../shared/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule, EmailModule],
  providers: [VerificationRepository, VerificationService, VerificationListener],
  exports: [VerificationService],
})
export class VerificationModule {
}
