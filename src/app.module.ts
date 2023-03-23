import { Module } from '@nestjs/common';
import { configModuleForRoot } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    configModuleForRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {
}
