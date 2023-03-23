import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';


@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
