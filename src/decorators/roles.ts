import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const RolesKey = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(RolesKey, roles);
