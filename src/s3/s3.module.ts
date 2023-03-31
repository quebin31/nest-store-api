import { Global, Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Global()
@Module({
  providers: [{ provide: S3Service, useFactory: S3Service.factory }],
  exports: [S3Service],
})
export class S3Module {
}
