import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { UsersModule } from '../users/users.module';
import { jwtModuleRegister } from './jwt.module';

@Module({
  imports: [jwtModuleRegister(), UsersModule],
  controllers: [AuthController],
  providers: [AuthRepository, AuthService],
})
export class AuthModule {
}
