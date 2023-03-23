import { AuthRepository } from './auth.repository';
import { SignUpDto } from './dto/sign-up-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { EventsService } from '../events/events.service';
import {
  BadRequestException, HttpException, HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export type SendVerificationOptions = { id: string, email?: string }

@Injectable()
export class AuthService {
  constructor(
    private authRepository: AuthRepository,
    private jwtService: JwtService,
    private usersService: UsersService,
    private eventsService: EventsService,
    private emailService: EmailService,
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
    const user = await this.usersService
      .createUser({ password: saltedPassword, ...rest })
      .catch(_ => {
        throw new BadRequestException('Email is already registered');
      });

    this.eventsService.emitSendVerificationEmailEvent({ id: user.id, email: user.email });
    return this.createAuthResponse(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
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

  async sendVerificationEmail(options: SendVerificationOptions) {
    const { id, email: maybeEmail } = options;

    let resolvedEmail: string;
    if (maybeEmail !== undefined) {
      resolvedEmail = maybeEmail;
    } else {
      const user = await this.usersService.findById(id);
      if (!user) {
        throw new NotFoundException(`Couldn't find user to send email to`);
      }

      resolvedEmail = user.email;
    }

    const requestedAt = await this.authRepository.getVerificationRequestedAtFor(id);
    if (requestedAt !== null && requestedAt + 60 * 1000 > Date.now()) {
      const httpCode = HttpStatus.TOO_MANY_REQUESTS;
      const error = 'Email verifications can only be sent every 60 seconds';
      throw new HttpException(error, httpCode);
    }

    const code = await this.authRepository.createVerificationCodeFor(id);
    await this.authRepository.saveVerificationRequestedAtFor(id);
    await this.emailService.sendVerificationCode(resolvedEmail, code);
  }
}
