import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { jwtModuleRegister } from './jwt.module';
import { LocalStrategy } from './local.strategy';
import { EmailModule } from '../../email/email.module';
import { VerificationModule } from '../verification/verification.module';
import { JwtStrategy } from './jwt.strategy';
import { RepositoriesModule } from '../../shared/repositories.module';

@Module({
  imports: [
    jwtModuleRegister(),
    RepositoriesModule,
    EmailModule,
    VerificationModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {
}
