import { Global, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { VerificationModule } from '../verification/verification.module';

@Global()
@Module({
  imports: [VerificationModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {
}
