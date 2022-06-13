import type { User } from '@prisma/client';
import { DashboardView } from '~/modules/projects/dashboard/dashboard-view';
import { getFollowingProjects } from '~/modules/projects/dashboard/get-following-projects';
import { getLatestProjects } from '~/modules/projects/dashboard/get-latest-projects';
import { getTrendingProjects } from '~/modules/projects/dashboard/get-trending-projects';
import type { FullProject } from '~/modules/projects/types/full-project';

interface Filters {
  user?: User;
  view: DashboardView;
  categories: number[];
}

export async function getProjectsForDashboard({
  user,
  view,
  categories,
}: Filters): Promise<FullProject[]> {
  switch (view) {
    case DashboardView.Latest:
      return getLatestProjects({ categories });

    case DashboardView.Following:
      return user
        ? getFollowingProjects({ user, categories })
        : getLatestProjects({ categories });

    default:
      return getTrendingProjects({ categories });
  }
}
