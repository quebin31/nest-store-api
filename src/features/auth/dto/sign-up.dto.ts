import { IsEmail, IsStrongPassword, Length, MaxLength } from 'class-validator';

export class SignUpDto {

  @IsEmail()
  email!: string;

  @MaxLength(32)
  @IsStrongPassword({ minLength: 8, minSymbols: 1, minNumbers: 1, minUppercase: 0 })
  password!: string;

  @Length(2, 64)
  name!: string;
}
