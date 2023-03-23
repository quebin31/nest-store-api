import * as redis from 'redis';
import { RedisClientType } from 'redis';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  public redis: RedisClientType;

  constructor(private configService: ConfigService<Config, true>) {
    const url = configService.get('redisUrl', { infer: true });
    this.redis = redis.createClient({ url });
  }

  async onModuleInit() {
    await this.redis.connect();
  }

  async onModuleDestroy() {
    await this.redis.disconnect();
  }
}
