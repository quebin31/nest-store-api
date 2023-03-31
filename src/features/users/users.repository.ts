import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import { Role, User } from '@prisma/client';

export type NewUser = Pick<User, 'email' | 'password' | 'name'>

@Injectable()
export class UsersRepository {
  constructor(private prismaService: PrismaService) {
  }

  async createUser(data: NewUser) {
    return this.prismaService.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async updateUser(id: string, data: Partial<User>) {
    return this.prismaService.user.update({ where: { id }, data });
  }

  async findManager(id: string) {
    return this.prismaService.user.findFirst({
      where: { id, role: Role.manager },
    });
  }
}
