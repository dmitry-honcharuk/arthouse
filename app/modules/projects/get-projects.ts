import type { ProjectStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import type { FullProject } from '~/modules/projects/types/full-project';

export async function getProjects(details?: {
  statuses?: ProjectStatus[];
  userId?: string;
}): Promise<FullProject[]> {
  return prisma.project.findMany({
    where: {
      ...(details?.statuses && {
        status: { in: details.statuses },
      }),
      userId: details?.userId,
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
