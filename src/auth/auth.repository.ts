import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

export type NewUser = Pick<User, 'email' | 'password' | 'name'>

@Injectable()
export class AuthRepository {
  constructor(private prismaService: PrismaService) {
  }

  async createUser(data: NewUser) {
    return this.prismaService.user.create({ data });
  }
}
