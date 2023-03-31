import { SignUpDto } from './dto/sign-up.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersRepository } from '../../shared/repositories/users.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SendVerificationEmailEvent } from '../../events';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private eventEmitter: EventEmitter2,
  ) {
  }

  private createAuthResponse(user: User) {
    const payload = { role: user.role };
    const accessToken = this.jwtService.sign(payload, { subject: user.id });
    return { id: user.id, accessToken };
  }

  async registerUser(signUpDto: SignUpDto, adminCall: boolean) {
    const { password, ...rest } = signUpDto;
    if (rest.role !== undefined && !adminCall) {
      throw new ForbiddenException('Only admins can sign up new managers');
    }

    const saltedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersRepository
      .createUser({ password: saltedPassword, ...rest })
      .catch(_ => {
        throw new BadRequestException('Email is already registered');
      });

    this.eventEmitter.emit(SendVerificationEmailEvent, user);
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
