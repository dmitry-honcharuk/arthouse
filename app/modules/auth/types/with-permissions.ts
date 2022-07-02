import type { Permission } from '@prisma/client';

export interface WithPermissions {
  permissions: Permission[];
}
