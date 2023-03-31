import { UseGuards } from '@nestjs/common';
import { VerifiedGuard } from '../modules/verification/verified.guard';

export const VerifiedUser = () => UseGuards(VerifiedGuard);
