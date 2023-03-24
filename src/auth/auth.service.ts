import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { EventsService } from '../events/events.service';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';

export type SendVerificationOptions = { id: string, email?: string }

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private eventsService: EventsService,
  ) {
  }

  private createAuthResponse(user: User) {
    const payload = { role: user.role };
    const accessToken = this.jwtService.sign(payload, { subject: user.id });
    return { id: user.id, accessToken };
  }

  async registerUser(signUpDto: SignUpDto) {
    const { password, ...rest } = signUpDto;
    const saltedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersRepository
      .createUser({ password: saltedPassword, ...rest })
      .catch(_ => {
        throw new BadRequestException('Email is already registered');
      });

    this.eventsService.emitSendVerificationEmailEvent({ id: user.id, email: user.email });
    return this.createAuthResponse(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isSamePassword = bcrypt.compare(password, user.password);
    if (!isSamePassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async loginUser(user: User) {
    return this.createAuthResponse(user);
  }
}
