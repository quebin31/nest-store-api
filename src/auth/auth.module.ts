import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { UsersModule } from '../users/users.module';
import { jwtModuleRegister } from './jwt.module';
import { LocalStrategy } from './local.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [jwtModuleRegister(), UsersModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService, LocalStrategy],
})
export class AuthModule {
}
