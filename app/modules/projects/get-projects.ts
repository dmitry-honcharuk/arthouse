import type { ProjectStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import type { FullProject } from '~/modules/projects/types/full-project';

interface Details {
  name?: string;
  statuses?: ProjectStatus[];
  userId?: string;
  isSecure?: boolean;
  tags?: string[];
}

export async function getProjects(details?: Details): Promise<FullProject[]> {
  return prisma.project.findMany({
    where: {
      name: {
        contains: details?.name,
        mode: 'insensitive',
      },
      ...(details?.statuses && {
        status: { in: details.statuses },
      }),
      userId: details?.userId,
      isSecure: details?.isSecure,
      AND: details?.tags?.map((tag) => ({
        tags: { some: { name: tag } },
      })),
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
