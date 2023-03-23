import { Global, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';

@Global()
@Module({
  imports: [AuthModule],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {
}
