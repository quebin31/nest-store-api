import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthRequest } from './jwt.strategy';
import { UsersRepository } from '../users/users.repository';
import { Reflector } from '@nestjs/core';
import { RolesKey } from '../../decorators/roles';
import { Role } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersRepository: UsersRepository,
  ) {
  }

  async canActivate(context: ExecutionContext) {
    const targets = [context.getClass(), context.getHandler()]
    const roles = this.reflector.getAllAndMerge<Role[]>(RolesKey, targets);
    if (!roles) return true;

    const request = context.switchToHttp().getRequest<AuthRequest>();
    const userId = request.user.id;
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new ForbiddenException(`Invalid user ${userId}`);
    }

    return roles.includes(user.role);
  }
}
