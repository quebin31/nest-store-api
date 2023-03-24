import { Module } from '@nestjs/common';
import { configModuleForRoot } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    configModuleForRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
  ],
  providers: [JwtAuthGuard.appProvider],
})
export class AppModule {
}
