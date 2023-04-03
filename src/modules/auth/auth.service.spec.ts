import { captor, mockDeep, mockReset } from 'jest-mock-extended';
import { UsersRepository } from '../../shared/users/users.repository';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { configModuleForRoot } from '../../config';
import { fakeSignUpDto } from '../../test/factories/auth';
import { Role } from '@prisma/client';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { fakeUser } from '../../test/factories/users';
import { isJWT } from 'class-validator';
import { SendVerificationEmailEvent } from '../../events';
import { faker } from '@faker-js/faker';
import { hashPassword } from '../../utils/auth';

describe('AuthService', () => {
  let authService: AuthService;
  const usersRepository = mockDeep<UsersRepository>();
  const eventEmitter = mockDeep<EventEmitter2>();

  beforeEach(async () => {
    mockReset(usersRepository);
    mockReset(eventEmitter);

    const moduleRef = await Test
      .createTestingModule({
        imports: [configModuleForRoot(), EventEmitterModule.forRoot(), AuthModule],
      })
      .useMocker(mockDeep)
      .overrideProvider(UsersRepository)
      .useValue(usersRepository)
      .overrideProvider(EventEmitter2)
      .useValue(eventEmitter)
      .compile();

    authService = moduleRef.get<AuthService>(AuthService);
  });

  describe('Register a new user', () => {
    it('fails if user role is defined and caller is not an admin', async () => {
      const data = fakeSignUpDto({ role: Role.manager });

      const error = captor<Error>();
      await expect(authService.registerUser(data, false)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(ForbiddenException);
      expect(error.value).toEqual(new ForbiddenException('Only admins can sign up new managers'));
    });

    it(`fails if user can't be created`, async () => {
      const data = fakeSignUpDto();
      usersRepository.createUser.mockRejectedValue(new Error());

      const error = captor<Error>();
      await expect(authService.registerUser(data, false)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(BadRequestException);
      expect(error.value).toEqual(new BadRequestException('Email is already registered'));
    });

    it('creates new user and emits verification email event', async () => {
      const data = fakeSignUpDto();
      const user = fakeUser();
      usersRepository.createUser.mockResolvedValue(user);

      const expected = captor();
      await expect(authService.registerUser(data, false)).resolves.toEqual(expected);
      expect(expected.value.id).toEqual(user.id);
      expect(isJWT(expected.value.accessToken)).toEqual(true);

      expect(eventEmitter.emit).toHaveBeenCalledWith(SendVerificationEmailEvent, user);
    });
  });

  describe('Validate a user', () => {
    it(`fails if user can't be found`, async () => {
      usersRepository.findByEmail.mockResolvedValue(null);
      const email = faker.internet.email();
      const password = faker.internet.password();

      const error = captor<Error>();
      await expect(authService.validateUser(email, password)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(UnauthorizedException);
      expect(error.value).toEqual(new UnauthorizedException('Invalid email or password'));
    });

    it(`fails if passwords don't match`, async () => {
      const hashedPassword = await hashPassword('password');
      const user = fakeUser({ password: hashedPassword });
      usersRepository.findByEmail.mockResolvedValue(user);

      const error = captor<Error>();
      await expect(authService.validateUser(user.email, 'invalid')).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(UnauthorizedException);
      expect(error.value).toEqual(new UnauthorizedException('Invalid email or password'));
    });

    it('returns the user if it is valid', async () => {
      const hashedPassword = await hashPassword('password');
      const user = fakeUser({ password: hashedPassword });
      usersRepository.findByEmail.mockResolvedValue(user);

      await expect(authService.validateUser(user.email, 'password')).resolves.toEqual(user);
    });
  });

  describe('Login a user', () => {
    it('returns a valid auth response', async () => {
      const user = fakeUser();

      const expected = captor();
      await expect(authService.loginUser(user)).resolves.toEqual(expected);
      expect(expected.value.id).toEqual(user.id);
      expect(isJWT(expected.value.accessToken)).toEqual(true);
    });
  });
});
