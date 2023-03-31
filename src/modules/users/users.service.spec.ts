import { UsersService } from './users.service';
import { captor, mockDeep, mockReset } from 'jest-mock-extended';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersRepository } from '../../shared/users/users.repository';
import { faker } from '@faker-js/faker';
import { NotFoundException } from '@nestjs/common';
import { fakeUser } from '../../test/factories/users';
import { pick } from 'lodash';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserUpdatedEmailEvent } from '../../events';

describe('UsersService', () => {
  const usersRepository = mockDeep<UsersRepository>();
  const eventEmitter = mockDeep<EventEmitter2>();
  const usersService = new UsersService(usersRepository, eventEmitter);

  beforeEach(() => {
    mockReset(usersRepository);
    mockReset(eventEmitter);
  });

  describe('Finding a user', () => {
    it('fails to find an user if it does not exist', async () => {
      const userId = faker.datatype.uuid();
      usersRepository.findById.calledWith(userId).mockResolvedValue(null);

      const error = captor<Error>();
      await expect(usersService.findById(userId, true)).rejects.toEqual(error);

      expect(error.value).toBeInstanceOf(NotFoundException);
      expect(error.value).toEqual(new NotFoundException(`Couldn't find user with id ${userId}`));
    });

    it('returns a user if found by id (as owner)', async () => {
      const user = fakeUser();
      usersRepository.findById.calledWith(user.id).mockResolvedValue(user);

      const expected = {
        ...pick(user, ['email', 'name', 'role', 'verifiedAt']),
        verified: false,
      };

      await expect(usersService.findById(user.id, true)).resolves.toEqual(expected);
    });

    it('returns a user if found by id', async () => {
      const user = fakeUser();
      usersRepository.findById.calledWith(user.id).mockResolvedValue(user);

      const expected = {
        ...pick(user, ['name', 'role', 'verifiedAt']),
        email: null,
        verified: false,
      };

      await expect(usersService.findById(user.id, false)).resolves.toEqual(expected);
    });
  });

  describe('Updating a user', () => {
    it('fails if user does not exist', async () => {
      const userId = faker.datatype.uuid();
      const data = {};
      usersRepository.findById.calledWith(userId).mockResolvedValue(null);

      const error = captor<Error>();
      await expect(usersService.updateUser(userId, data)).rejects.toEqual(error);

      expect(error.value).toBeInstanceOf(NotFoundException);
      expect(error.value).toEqual(new NotFoundException(`No user found with id ${userId}`));
    });

    it('resets verified state if email is changed', async () => {
      const user = fakeUser();
      const email = faker.internet.email();
      const data: UpdateUserDto = { email };
      const updated = { ...user, email };

      usersRepository.findById.calledWith(user.id).mockResolvedValue(user);
      usersRepository.updateUser
        .calledWith(user.id, expect.anything())
        .mockResolvedValue(updated);

      const expected = {
        ...pick(updated, ['email', 'name', 'role', 'verifiedAt']),
        verified: false,
      };

      await expect(usersService.updateUser(user.id, data)).resolves.toEqual(expected);
      expect(eventEmitter.emit).toHaveBeenCalledWith(UserUpdatedEmailEvent, updated);
    });
  });
});
