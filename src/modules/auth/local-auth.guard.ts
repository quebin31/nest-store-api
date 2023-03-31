import { AuthGuard } from '@nestjs/passport';
import { Injectable, UseGuards } from '@nestjs/common';

export const LocalAuth = () => UseGuards(LocalAuthGuard);

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
}
