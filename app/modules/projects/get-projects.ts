import { ProjectStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import type { FullProject } from '~/modules/projects/types/full-project';

export async function getProjects(): Promise<FullProject[]> {
  return prisma.project.findMany({
    where: {
      status: ProjectStatus.PUBLISHED,
    },
    include: {
      items: true,
      user: {
        include: {
          profile: true,
        },
      },
    },
  });
}
