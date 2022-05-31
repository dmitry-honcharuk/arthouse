import { ProjectStatus } from '@prisma/client';
import { getProjects } from '~/modules/projects/get-projects';
import type { FullProject } from '~/modules/projects/types/full-project';

export async function getLatestProjects({
  categories,
}: {
  categories: number[];
}): Promise<FullProject[]> {
  return getProjects({
    statuses: [ProjectStatus.PUBLISHED],
    isSecure: false,
    order: { createdAt: 'desc' },
    categories,
    tagsCategoriesSet: 'union',
  });
}
