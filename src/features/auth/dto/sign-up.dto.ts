import { IsDefined, IsEmail, IsStrongPassword, Length, MaxLength } from 'class-validator';

export class SignUpDto {

  @IsDefined()
  @IsEmail()
  email!: string;

  @IsDefined()
  @MaxLength(32)
  @IsStrongPassword({ minLength: 8, minSymbols: 1, minNumbers: 1, minUppercase: 0 })
  password!: string;

  @IsDefined()
  @Length(2, 64)
  name!: string;
}
