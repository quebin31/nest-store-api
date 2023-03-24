import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { jwtModuleRegister } from './jwt.module';
import { LocalStrategy } from './local.strategy';
import { EmailModule } from '../email/email.module';
import { VerificationModule } from '../verification/verification.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [jwtModuleRegister(), UsersModule, EmailModule, VerificationModule],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {
}
