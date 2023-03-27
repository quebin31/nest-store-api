import { Module } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [],
  providers: [UsersRepository, UsersService],
  exports: [UsersRepository, UsersService],
  controllers: [UsersController],
})
export class UsersModule {
}
