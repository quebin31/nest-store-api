import { Module } from '@nestjs/common';
import { SharedUsersModule } from '../../shared/users/users.module';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  imports: [SharedUsersModule],
  providers: [UsersService],
})
export class UsersModule {
}
