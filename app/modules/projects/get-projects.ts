import type { ProjectStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import type { FullProject } from '~/modules/projects/types/full-project';

type SortOrder = 'asc' | 'desc';

interface Details {
  name?: string;
  statuses?: ProjectStatus[];
  userId?: string;
  isSecure?: boolean;
  tags?: string[];
  ids?: { include?: string[]; exclude?: string[] };
  order?: { favoriteCount?: SortOrder; createdAt?: SortOrder };
  categories?: number[];
}

export async function getProjects(details?: Details): Promise<FullProject[]> {
  return prisma.project.findMany({
    where: {
      id: {
        in: details?.ids?.include,
        notIn: details?.ids?.exclude,
      },
      name: {
        contains: details?.name,
        mode: 'insensitive',
      },
      ...(details?.statuses && {
        status: { in: details.statuses },
      }),
      userId: details?.userId,
      isSecure: details?.isSecure,
      AND:
        details?.tags || details?.categories
          ? [
              ...(details?.tags?.map((tag) => ({
                tags: { some: { name: tag } },
              })) ?? []),
              ...(details?.categories?.map((categoryId) => ({
                categories: { some: { id: categoryId } },
              })) ?? []),
            ]
          : undefined,
    },
    include: {
      items: true,
      user: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: details?.order,
  });
}
