import type { ProjectStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import type { FullProject } from '~/modules/projects/types/full-project';

export async function getProjects(details?: {
  statuses?: ProjectStatus[];
  userId?: string;
  isSecure?: boolean;
}): Promise<FullProject[]> {
  return prisma.project.findMany({
    where: {
      ...(details?.statuses && {
        status: { in: details.statuses },
      }),
      userId: details?.userId,
      isSecure: details?.isSecure,
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
