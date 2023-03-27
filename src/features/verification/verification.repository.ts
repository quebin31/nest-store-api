import { Injectable } from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { customAlphabet } from 'nanoid';
import { nolookalikes } from 'nanoid-dictionary';
import { PrismaService } from '../../prisma/prisma.service';

const generateVerificationCode = customAlphabet(nolookalikes, 6);

@Injectable()
export class VerificationRepository {
  constructor(
    private prismaService: PrismaService,
    private redisService: RedisService,
  ) {
  }

  private codeKey = (id: string) => `verification:${id}:code`;
  private requestedAtKey = (id: string) => `verification:${id}:requestedAt`;
  private isVerifiedKey = (id: string) => `verification:${id}:isVerified`;


  async findUserById(id: string) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async createVerificationCodeFor(id: string) {
    const verificationCode = generateVerificationCode();
    const key = this.codeKey(id);
    const options = { EX: 24 * 60 * 60 * 1000 };
    await this.redisService.redis.set(key, verificationCode, options);
    await this.redisService.redis.set(this.requestedAtKey(id), Date.now(), options);
    return verificationCode;
  }

  async getVerificationCodeFor(id: string) {
    const key = this.codeKey(id);
    return this.redisService.redis.get(key);
  }

  async getRequestedAtFor(id: string) {
    const key = this.requestedAtKey(id);
    const val = await this.redisService.redis.get(key);
    return val !== null ? parseInt(val) : val;
  }

  async delRequestedAtFor(id: string) {
    await this.redisService.redis.del(this.requestedAtKey(id));
  }

  async setIsVerifiedFor(id: string, isVerified: boolean | null) {
    const key = this.isVerifiedKey(id);
    if (isVerified === null) {
      await this.redisService.redis.del(this.isVerifiedKey(id));
    } else {
      const options = { EX: 24 * 60 * 60 * 1000 };
      await this.redisService.redis.set(key, `${isVerified}`, options);
    }
  }

  async getIsVerifiedFor(id: string) {
    const key = this.isVerifiedKey(id);
    const val = await this.redisService.redis.get(key);
    return val !== null ? val === 'true' : val;
  }

  async updateUser(id: string, { isVerified }: { isVerified: boolean }) {
    const user = await this.prismaService.user.update({
      where: { id },
      data: { verifiedAt: isVerified ? new Date() : null },
    });

    await this.redisService.redis.del(this.codeKey(id));
    await this.delRequestedAtFor(id);
    await this.setIsVerifiedFor(id, isVerified);

    return user;
  }
}
