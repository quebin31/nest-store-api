import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { customAlphabet } from 'nanoid';
import { nolookalikes } from 'nanoid-dictionary';

const generateVerificationCode = customAlphabet(nolookalikes, 6);

@Injectable()
export class VerificationRepository {
  constructor(private redisService: RedisService) {
  }

  private codeKey = (id: string) => `verification:${id}:code`;
  private requestedAtKey = (id: string) => `verification:${id}:requestedAt`;
  private isVerifiedKey = (id: string) => `verification:${id}:isVerified`;

  async createVerificationCodeFor(userId: string) {
    const verificationCode = generateVerificationCode();
    const key = this.codeKey(userId);
    await this.redisService.redis.set(key, verificationCode);
    return verificationCode;
  }

  async getVerificationCodeFor(userId: string) {
    const key = this.codeKey(userId);
    return this.redisService.redis.get(key);
  }

  async saveRequestedAtFor(userId: string) {
    await this.redisService.redis.set(this.requestedAtKey(userId), Date.now());
  }

  async getRequestedAtFor(userId: string) {
    const key = this.requestedAtKey(userId);
    const value = await this.redisService.redis.get(key);
    return value !== null ? parseInt(value) : value;
  }
}
