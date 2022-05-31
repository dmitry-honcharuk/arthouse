import type { ProjectStatus } from '@prisma/client';
import { prisma } from '~/db.server';
import type { FullProject } from '~/modules/projects/types/full-project';

type SortOrder = 'asc' | 'desc';

interface Details {
  name?: string;
  statuses?: ProjectStatus[];
  userId?: string;
  isSecure?: boolean;
  ids?: { include?: string[]; exclude?: string[] };
  order?: { favoriteCount?: SortOrder; createdAt?: SortOrder };
  tags?: string[];
  categories?: number[];
  tagsCategoriesSet?: 'intersection' | 'union';
}

export async function getProjects(details?: Details): Promise<FullProject[]> {
  const tagsCategoriesSetType = details?.tagsCategoriesSet ?? 'intersection';

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
      ...(tagsCategoriesSetType === 'intersection'
        ? {
            AND: [
              ...(details?.tags?.map((tag) => ({
                tags: { some: { name: tag } },
              })) ?? []),
              ...(details?.categories?.map((categoryId) => ({
                categories: { some: { id: categoryId } },
              })) ?? []),
            ],
          }
        : {
            ...(details?.categories?.length && {
              categories: { some: { id: { in: details.categories } } },
            }),
            ...(details?.tags?.length && {
              tags: { some: { name: { in: details.tags } } },
            }),
          }),
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
