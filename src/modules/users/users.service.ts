import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../shared/users/users.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserUpdatedEmailEvent } from '../../events';
import { pick } from 'lodash';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private eventEmitter: EventEmitter2,
  ) {
  }

  static createUserResponse(user: User, isOwner: boolean) {
    return {
      ...pick(user, ['name', 'role', 'verifiedAt']),
      email: isOwner ? user.email : null,
      verified: user.verifiedAt !== null,
    };
  }

  async findById(id: string, isOwner: boolean) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Couldn't find user with id ${id}`);
    }

    return UsersService.createUserResponse(user, isOwner);
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`No user found with id ${id}`);
    }

    const isUpdatingEmail = data.email !== undefined && data.email !== user.email;
    const updated = await this.usersRepository.updateUser(id, {
      ...data,
      verifiedAt: isUpdatingEmail ? null : undefined,
    });

    if (isUpdatingEmail) {
      this.eventEmitter.emit(UserUpdatedEmailEvent, updated);
    }

    return UsersService.createUserResponse(updated, true);
  }
}
