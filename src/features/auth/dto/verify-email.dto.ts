import { IsDefined } from 'class-validator';

export class VerifyEmailDto {

  @IsDefined()
  verificationCode!: string;
}
