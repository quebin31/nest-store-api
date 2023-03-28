import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { Role, User } from '@prisma/client';
import { Request } from 'express';
import { Public } from '../../decorators/public';
import { AuthRequest, OptionalAuthRequest } from './jwt.strategy';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerificationService } from '../verification/verification.service';
import { RolesGuard } from './roles.guard';
import { Roles } from '../../decorators/roles';

@Controller({ path: '/auth', version: '1' })
export class AuthController {
  constructor(
    private authService: AuthService,
    private verificationService: VerificationService,
  ) {
  }

  @Public({ optionalAuth: true })
  @Roles(Role.admin)
  @UseGuards(RolesGuard)
  @HttpCode(201)
  @Post('/sign-up')
  async signUp(@Body() data: SignUpDto, @Req() req: OptionalAuthRequest) {
    return this.authService.registerUser(data, req.user?.id !== undefined);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('/sign-in')
  async signIn(@Req() req: Request) {
    return this.authService.loginUser(req.user as User);
  }

  @HttpCode(200)
  @Post('/verify-email')
  async verifyEmail(@Req() req: AuthRequest, @Body() data: VerifyEmailDto) {
    return this.verificationService.verifyUserEmail(req.user.id, data.verificationCode);
  }

  @HttpCode(204)
  @Post('/resend-email')
  async resendEmail(@Req() req: AuthRequest) {
    await this.verificationService.sendVerificationEmail({ user: req.user });
  }
}
