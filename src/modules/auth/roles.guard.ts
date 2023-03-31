import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { OptionalAuthRequest } from './jwt.strategy';
import { UsersRepository } from '../../shared/users/users.repository';
import { Reflector } from '@nestjs/core';
import { RolesKey } from '../../decorators/roles';
import { Role } from '@prisma/client';
import { PublicOptions, PublicOptionsKey } from '../../decorators/public';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersRepository: UsersRepository,
  ) {
  }

  async canActivate(context: ExecutionContext) {
    const targets = [context.getClass(), context.getHandler()];
    const roles = this.reflector.getAllAndMerge<Role[]>(RolesKey, targets);
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<OptionalAuthRequest>();
    const userId = request.user?.id;
    if (!userId) {
      const publicOptions = this.reflector
        .getAllAndOverride<PublicOptions | undefined>(PublicOptionsKey, targets);
      return publicOptions !== undefined;
    }

    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new ForbiddenException(`Invalid user ${userId}`);
    }

    return roles.includes(user.role);
  }
}
