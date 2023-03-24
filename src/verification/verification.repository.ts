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

  async createVerificationCodeFor(id: string) {
    const verificationCode = generateVerificationCode();
    const key = this.codeKey(id);
    await this.redisService.redis.set(key, verificationCode);
    return verificationCode;
  }

  async getVerificationCodeFor(id: string) {
    const key = this.codeKey(id);
    return this.redisService.redis.get(key);
  }

  async setRequestedAtFor(id: string) {
    await this.redisService.redis.set(this.requestedAtKey(id), Date.now());
  }

  async getRequestedAtFor(id: string) {
    const key = this.requestedAtKey(id);
    const val = await this.redisService.redis.get(key);
    return val !== null ? parseInt(val) : val;
  }

  async setIsVerifiedFor(id: string, isVerified: boolean) {
    const key = this.isVerifiedKey(id);
    await this.redisService.redis.set(key, `${isVerified}`);
  }

  async getIsVerifiedFor(id: string) {
    const key = this.isVerifiedKey(id);
    const val = await this.redisService.redis.get(key);
    return val !== null ? val === 'true' : val;
  }
}
