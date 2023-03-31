import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { Config } from './config';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './shared/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global configuration
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Prisma shutdown hooks
  const prismaService = await app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const configService: ConfigService<Config, true> = app.get(ConfigService);
  const port = configService.get('port', { infer: true });
  await app.listen(parseInt(port));
}

bootstrap().catch(e => console.log(`Failed to bootstrap server: ${e}`));
