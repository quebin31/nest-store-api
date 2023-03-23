import { Module } from '@nestjs/common';
import { configModuleForRoot } from './config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    configModuleForRoot(),
    PrismaModule,
    AuthModule,
  ],
})
export class AppModule {
}
