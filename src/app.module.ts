import { Module } from '@nestjs/common';
import { configModuleForRoot } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { EventsModule } from './events/events.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [
    configModuleForRoot(),
    PrismaModule,
    RedisModule,
    EventsModule,
    AuthModule,
  ],
  providers: [JwtAuthGuard.appProvider],
})
export class AppModule {
}
