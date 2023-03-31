import { S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { fromEnv } from '@aws-sdk/credential-providers';
import { ConfigModule } from '@nestjs/config';

@Injectable()
export class S3Service extends S3Client {

  static async factory() {
    await ConfigModule.envVariablesLoaded;
    return new S3Service();
  }

  constructor() {
    super({ credentials: fromEnv(), region: 'us-west-1' });
  }
}
