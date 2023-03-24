import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PublicOptionsKey, PublicOptions } from '../decorators/public';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  static appProvider = { provide: APP_GUARD, useClass: JwtAuthGuard };

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const targets = [context.getHandler(), context.getClass()];
    const options = this.reflector
      .getAllAndOverride<PublicOptions | undefined>(PublicOptionsKey, targets);

    if (options !== undefined) {
      if (options.optionalAuth) super.canActivate(context);
      return true;
    } else {
      return super.canActivate(context);
    }
  }
}
