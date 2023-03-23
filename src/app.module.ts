import { Module } from '@nestjs/common';
import { configModuleForRoot } from './config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [configModuleForRoot(), PrismaModule],
})
export class AppModule {
}
