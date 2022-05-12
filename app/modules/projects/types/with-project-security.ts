import type { ProjectSecurity } from '@prisma/client';

export interface WithProjectSecurity {
  security: ProjectSecurity | null;
}
