import type { Project } from '@prisma/client';

export interface WithProject {
  project: Project;
}
