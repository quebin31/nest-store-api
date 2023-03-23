import { Module } from '@nestjs/common';
import { configModuleForRoot } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    configModuleForRoot(),
    PrismaModule,
    RedisModule,
    EventsModule,
    AuthModule,
    UsersModule,
    EmailModule,
    EventsModule,
  ],
})
export class AppModule {
}
