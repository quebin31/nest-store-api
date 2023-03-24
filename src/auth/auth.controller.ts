import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up-dto';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from '@prisma/client';
import { Request } from 'express';
import { Public } from '../decorators/public';

@Controller({ path: '/auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Public()
  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.registerUser(signUpDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  async signIn(@Req() req: Request) {
    return this.authService.loginUser(req.user as User);
  }

  @Post('/verify-email')
  async verifyEmail() {
    throw new Error('Not yet implemented');
  }

  @Post('/resend-email')
  async resendEmail() {
    throw new Error('Not yet implemented');
  }
}
