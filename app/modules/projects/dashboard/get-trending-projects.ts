import { ProjectStatus } from '@prisma/client';
import { subWeeks } from 'date-fns';
import { prisma } from '~/db.server';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';

export async function getTrendingProjects({
  categories,
}: {
  categories: number[];
}): Promise<FullProject[]> {
  const countByFavourites = await prisma.favorite.groupBy({
    by: ['projectId'],
    _count: true,
    where: {
      createdAt: { gte: subWeeks(new Date(), 1) },
      project: {
        status: ProjectStatus.PUBLISHED,
        isSecure: false,
        ...(categories.length && {
          categories: { some: { id: { in: categories } } },
        }),
      },
    },
  });

  const trendingIds = countByFavourites.map(({ projectId }) => projectId);
  const favouritesMap = new Map(
    countByFavourites.map(({ projectId, _count }) => [projectId, _count])
  );

  const [trendingProjects, otherProjects] = await Promise.all([
    getProjects({
      ids: {
        include: trendingIds,
      },
    }),
    getProjects({
      ids: {
        exclude: trendingIds,
      },
      statuses: [ProjectStatus.PUBLISHED],
      isSecure: false,
      ...(categories.length && { categories }),
      categoriesSet: 'union',
      order: { favoriteCount: 'desc' },
    }),
  ]);

  return [
    ...trendingProjects.sort(({ id: firstId }, { id: secondId }) => {
      const first = favouritesMap.get(firstId);
      const second = favouritesMap.get(secondId);

      if (first === second) {
        return 0;
      }

      return (first ?? 0) < (second ?? 0) ? 1 : -1;
    }),
    ...otherProjects,
  ];
}
