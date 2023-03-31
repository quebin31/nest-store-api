import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RolesGuard } from '../modules/auth/roles.guard';

export const RolesKey = 'roles';
export const Roles = (...roles: Role[]) => {
  return applyDecorators(SetMetadata(RolesKey, roles), UseGuards(RolesGuard));
};
