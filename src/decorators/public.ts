import { SetMetadata } from '@nestjs/common';

export const IsPublicKey = 'isPublic';
export const Public = () => SetMetadata(IsPublicKey, true);
