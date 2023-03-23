import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { customAlphabet } from 'nanoid';
import { nolookalikes } from 'nanoid-dictionary';

const codeGenerator = customAlphabet(nolookalikes, 6);

@Injectable()
export class AuthRepository {
  constructor(
    private prismaService: PrismaService,
    private redisService: RedisService,
  ) {
  }

  private verificationCodeKey = (id: string) => `verification:${id}:code`;
  private verificationRequestedAtKey = (id: string) => `verification:${id}:requestedAt`;
  private verificationIsVerifiedKey = (id: string) => `verification:${id}:isVerified`;

  async createVerificationCodeFor(userId: string) {
    const verificationCode = codeGenerator();
    const key = this.verificationCodeKey(userId);
    await this.redisService.redis.set(key, verificationCode);
    return verificationCode;
  }

  async getVerificationCodeFor(userId: string) {
    const key = this.verificationCodeKey(userId);
    return this.redisService.redis.get(key);
  }

  async saveVerificationRequestedAtFor(userId: string) {
    await this.redisService.redis.set(this.verificationRequestedAtKey(userId), Date.now());
  }

  async getVerificationRequestedAtFor(userId: string) {
    const key = this.verificationRequestedAtKey(userId);
    const value = await this.redisService.redis.get(key);
    return value !== null ? parseInt(value) : value;
  }
}
