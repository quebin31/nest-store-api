import { Injectable } from '@nestjs/common';
import { NewUser, UsersRepository } from './users.repository';


@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {
  }


  async createUser(user: NewUser) {
    return this.usersRepository.createUser(user);
  }

  async findById(id: string) {
    return this.usersRepository.findById(id);
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }
}
