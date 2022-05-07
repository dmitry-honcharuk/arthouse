import type { ProjectSecurity } from '@prisma/client';

export interface WithProjectSecurity {
  projectSecurity: ProjectSecurity | null;
}
