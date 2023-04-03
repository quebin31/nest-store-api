import { VerificationService } from './verification.service';
import { VerificationRepository } from './verification.repository';
import { EmailService } from '../../shared/email/email.service';
import { captor, mockDeep, mockReset } from 'jest-mock-extended';
import { UsersRepository } from '../../shared/users/users.repository';
import { Test } from '@nestjs/testing';
import { VerificationModule } from './verification.module';
import { randomUUID } from 'crypto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { fakeUser } from '../../test/factories/users';
import { omit, pick } from 'lodash';
import { TooManyRequestsException } from '../../errors';

describe('VerificationService', () => {
  let verificationService: VerificationService;
  const verificationRepository = mockDeep<VerificationRepository>();
  const emailService = mockDeep<EmailService>();
  const usersRepository = mockDeep<UsersRepository>();

  beforeEach(async () => {
    mockReset(verificationRepository);
    mockReset(emailService);
    mockReset(usersRepository);

    const moduleRef = await Test
      .createTestingModule({ imports: [VerificationModule] })
      .useMocker(mockDeep)
      .overrideProvider(VerificationRepository)
      .useValue(verificationRepository)
      .overrideProvider(EmailService)
      .useValue(emailService)
      .overrideProvider(UsersRepository)
      .useValue(usersRepository)
      .compile();

    verificationService = moduleRef.get<VerificationService>(VerificationService);
  });

  describe('Check if user is verified', () => {
    it('returns value from cache if it exists', async () => {
      const userId = randomUUID();
      verificationRepository.getIsVerifiedFor.calledWith(userId).mockResolvedValue(true);

      await expect(verificationService.isUserVerified(userId)).resolves.toEqual(true);
    });

    it('fails if there is not cache and user is not found', async () => {
      const userId = randomUUID();
      verificationRepository.getIsVerifiedFor.mockResolvedValue(null);
      usersRepository.findById.calledWith(userId).mockResolvedValue(null);

      const error = captor<Error>();
      await expect(verificationService.isUserVerified(userId)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(NotFoundException);
      expect(error.value).toEqual(new NotFoundException('User does not exist'));
    });

    it.each([
      { verified: false },
      { verified: true },
    ])('returns value from user and updates cache (%p)', async ({ verified }) => {
      const user = fakeUser({ verifiedAt: verified ? new Date() : null });
      verificationRepository.getIsVerifiedFor.mockResolvedValue(null);
      usersRepository.findById.calledWith(user.id).mockResolvedValue(user);

      await expect(verificationService.isUserVerified(user.id)).resolves.toEqual(verified);
    });
  });

  describe('Send verification email', () => {
    it('fails if user is already verified', async () => {
      const user = fakeUser();
      const options = { user: pick(user, 'id') };
      verificationRepository.getIsVerifiedFor.mockResolvedValue(true);

      const error = captor<Error>();
      await expect(verificationService.sendVerificationEmail(options)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(BadRequestException);
      expect(error.value).toEqual(new BadRequestException('User is already verified'));
    });

    it(`fails if user doesn't exist when looking for email`, async () => {
      const userId = randomUUID();
      const options = { user: { id: userId } }; // no email
      verificationRepository.getIsVerifiedFor.mockResolvedValue(false);
      usersRepository.findById.mockResolvedValue(null);

      const error = captor<Error>();
      await expect(verificationService.sendVerificationEmail(options)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(NotFoundException);
      expect(error.value).toEqual(new NotFoundException(`Couldn't find user to send email to`));
    });

    it('fails if not enough time has passed since last request', async () => {
      const user = fakeUser();
      const options = { user };
      verificationRepository.getIsVerifiedFor.mockResolvedValue(false);
      verificationRepository.getRequestedAtFor.mockResolvedValue(Date.now());

      const error = captor<Error>();
      await expect(verificationService.sendVerificationEmail(options)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(TooManyRequestsException);
      expect(error.value).toEqual(new TooManyRequestsException('Email verifications can only be sent every 60 seconds'));
    });

    it.each([
      { omitEmail: true },
      { omitEmail: false },
    ])('creates and sends verification code (%p)', async ({ omitEmail }) => {
      const user = fakeUser();
      const options = { user: omitEmail ? omit(user, 'email') : user };
      const code = 'ABC123';

      usersRepository.findById.calledWith(user.id).mockResolvedValue(user);
      verificationRepository.getIsVerifiedFor.mockResolvedValue(false);
      verificationRepository.createVerificationCodeFor
        .calledWith(user.id)
        .mockResolvedValue(code);

      await verificationService.sendVerificationEmail(options);

      expect(emailService.sendVerificationCode)
        .toHaveBeenCalledWith(user.email, expect.anything(), code);
    });

    it('resets verification process if user has changed their email', async () => {
      const user = fakeUser();
      const options = { user, hasChangedEmail: true };
      const code = 'ABC123';

      verificationRepository.getIsVerifiedFor.mockResolvedValue(false);
      verificationRepository.createVerificationCodeFor
        .calledWith(user.id)
        .mockResolvedValue(code);

      await verificationService.sendVerificationEmail(options);

      expect(emailService.sendVerificationCode)
        .toHaveBeenCalledWith(user.email, expect.anything(), code);

      expect(verificationRepository.delRequestedAtFor).toHaveBeenCalledWith(user.id);
      expect(verificationRepository.setIsVerifiedFor).toHaveBeenCalledWith(user.id, false);
    });
  });

  describe('Verify user email', () => {
    it('fails if verification code is not found', async () => {
      const userId = randomUUID();
      const code = 'ABC123';
      verificationRepository.getVerificationCodeFor.calledWith(userId).mockResolvedValue(null);

      const error = captor<Error>();
      await expect(verificationService.verifyUserEmail(userId, code)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(NotFoundException);
      expect(error.value).toEqual(new NotFoundException(`Couldn't find an active verification process`));
    });

    it(`fails if codes don't match`, async () => {
      const userId = randomUUID();
      const code = 'ABC123';
      verificationRepository.getVerificationCodeFor.calledWith(userId).mockResolvedValue(code);

      const error = captor<Error>();
      await expect(verificationService.verifyUserEmail(userId, '123ABC')).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(BadRequestException);
      expect(error.value).toEqual(new BadRequestException('Received an invalid verification code'));
    });

    it(`fails if user couldn't be updated`, async () => {
      const userId = randomUUID();
      const code = 'ABC123';
      verificationRepository.getVerificationCodeFor.calledWith(userId).mockResolvedValue(code);
      verificationRepository.updateUser.mockRejectedValue(new Error());

      const error = captor<Error>();
      await expect(verificationService.verifyUserEmail(userId, code)).rejects.toEqual(error);
      expect(error.value).toBeInstanceOf(NotFoundException);
      expect(error.value).toEqual(new NotFoundException(`User to verify doesn't exist`));
    });

    it('returns verified user on success', async () => {
      const user = fakeUser();
      const code = 'ABC123';
      const updated = { ...user, verifiedAt: new Date() };
      verificationRepository.getVerificationCodeFor.calledWith(user.id).mockResolvedValue(code);
      verificationRepository.updateUser.mockResolvedValue(updated);

      const expected = {
        ...pick(updated, ['name', 'email', 'role', 'verifiedAt']),
        verified: true,
      };

      await expect(verificationService.verifyUserEmail(user.id, code)).resolves.toEqual(expected);
    });
  });
});
