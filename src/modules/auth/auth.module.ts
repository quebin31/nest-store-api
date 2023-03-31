import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtModuleRegister } from './jwt.module';
import { LocalStrategy } from './local.strategy';
import { EmailModule } from '../../shared/email/email.module';
import { VerificationModule } from '../verification/verification.module';
import { JwtStrategy } from './jwt.strategy';
import { SharedUsersModule } from '../../shared/users/users.module';

@Module({
  controllers: [AuthController],
  imports: [
    jwtModuleRegister(),
    SharedUsersModule,
    EmailModule,
    VerificationModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {
}
