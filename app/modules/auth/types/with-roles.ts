import type { Role } from '@prisma/client';

export interface WithRoles {
  roles: Role[];
}
