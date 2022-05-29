import { ProjectStatus } from '@prisma/client';
import type { FullProject } from '~/modules/projects/types/full-project';
import { getProjects } from '../get-projects';

export async function getLatestProjects(): Promise<FullProject[]> {
  return getProjects({
    statuses: [ProjectStatus.PUBLISHED],
    isSecure: false,
    order: { createdAt: 'desc' },
  });
}
