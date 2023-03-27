import { Module } from '@nestjs/common';
import { configModuleForRoot } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './features/auth/auth.module';
import { RedisModule } from './redis/redis.module';
import { JwtAuthGuard } from './features/auth/jwt-auth.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UsersModule } from './features/users/users.module';

@Module({
  imports: [
    configModuleForRoot(),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
  ],
  providers: [JwtAuthGuard.appProvider],
})
export class AppModule {
}
