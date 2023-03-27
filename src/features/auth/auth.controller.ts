import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { User } from '@prisma/client';
import { Request } from 'express';
import { Public } from '../../decorators/public';
import { AuthRequest } from './jwt.strategy';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerificationService } from '../verification/verification.service';

@Controller({ path: '/auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private verificationService: VerificationService,
  ) {
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
  async verifyEmail(@Req() req: AuthRequest, @Body() verifyEmailDto: VerifyEmailDto) {
    return this.verificationService.verifyUserEmail(req.user.id, verifyEmailDto.verificationCode);
  }

  @HttpCode(204)
  @Post('/resend-email')
  async resendEmail(@Req() req: AuthRequest) {
    await this.verificationService.sendVerificationEmail({ user: req.user });
  }
}
