import { ExecutionContext, SetMetadata, applyDecorators, UseGuards } from '@nestjs/common';
import { RolesGuard } from './roles.guard';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) =>
  applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(new RolesGuard(roles)),
  );
