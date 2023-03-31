import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { AuthRequest } from '../auth/jwt.strategy';

@Injectable()
export class VerifiedGuard implements CanActivate {

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    if (request.user.isVerified) {
      return true;
    } else {
      throw new ForbiddenException('Must be verified to use this resource');
    }
  }
}
