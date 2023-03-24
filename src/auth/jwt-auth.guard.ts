import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { IsPublicKey } from '../decorators/public';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  static appProvider = { provide: APP_GUARD, useClass: JwtAuthGuard };

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    const isPublic = this.reflector.getAllAndOverride<boolean>(IsPublicKey, targets);
    return isPublic || super.canActivate(context);
  }
}
