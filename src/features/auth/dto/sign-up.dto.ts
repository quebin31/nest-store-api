import {
  IsDefined,
  IsEmail, IsIn,
  IsOptional,
  IsStrongPassword,
  Length,
  MaxLength,
} from 'class-validator';
import { Role } from '@prisma/client';

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

  @IsOptional()
  @IsIn([Role.manager])
  role?: Extract<Role, 'manager'>;
}
