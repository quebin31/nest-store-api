import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { SignUpDto } from './dto/sign-up-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
  ) {
  }

  async registerUser(signUpDto: SignUpDto) {
    const { password, ...rest } = signUpDto;
    const saltedPassword = await bcrypt.hash(password, 10);
    const user = await this.authRepository
      .createUser({ password: saltedPassword, ...rest })
      .catch(_ => {
        throw new BadRequestException('Email is already registered');
      });

    const payload = { role: user.role };
    const accessToken = this.jwtService.sign(payload, { subject: user.id });
    return { id: user.id, accessToken };
  }
}
