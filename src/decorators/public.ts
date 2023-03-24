import { SetMetadata } from '@nestjs/common';

export type PublicOptions = { optionalAuth: boolean }

export const PublicOptionsKey = 'publicOptions';
export const Public = (options?: PublicOptions) => SetMetadata(PublicOptionsKey, options ?? {});
