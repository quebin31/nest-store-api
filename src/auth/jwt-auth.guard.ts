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

  private async optionalCanActivate(context: ExecutionContext) {
    try {
      await super.canActivate(context);
    } catch {
      // no-op
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getClass(), context.getHandler()];
    const options = this.reflector
      .getAllAndOverride<PublicOptions | undefined>(PublicOptionsKey, targets);

    if (options !== undefined) {
      if (options.optionalAuth) await this.optionalCanActivate(context);
      return true;
    } else {
      return super.canActivate(context) as Promise<boolean>;
    }
  }
}
