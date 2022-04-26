import type { Project, ProjectItem } from '@prisma/client';

export interface ProjectWithItems extends Project {
  items: ProjectItem[];
}
