import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Config } from '../config';
import { VerificationService } from '../verification/verification.service';
import { Request } from 'express';

export type UserJwtPayload = { id: string, isVerified: boolean }
export type AuthRequest = Request & { user: UserJwtPayload }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService<Config, true>,
    private verificationService: VerificationService,
  ) {
    const secret = configService.get('jwtSecret', { infer: true });
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // noinspection JSUnusedGlobalSymbols
  async validate(payload: { sub: string }): Promise<UserJwtPayload> {
    const userId = payload.sub;
    const isVerified = await this.verificationService.isUserVerified(userId);
    return { id: userId, isVerified };
  }
}
