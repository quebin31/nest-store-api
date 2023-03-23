import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up-dto';

@Controller({ path: '/auth', version: '1' })
export class AuthController {
  constructor(private authService: AuthService) {
  }

  @Post('/sign-up')
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.registerUser(signUpDto);
  }

  @Post('/sign-in')
  async signIn() {
    throw new Error('Not yet implemented');
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
