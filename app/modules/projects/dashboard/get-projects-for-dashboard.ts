import { DashboardSorting } from '~/modules/projects/dashboard/dashboard-sorting';
import { getLatestProjects } from '~/modules/projects/dashboard/get-latest-projects';
import { getTrendingProjects } from '~/modules/projects/dashboard/get-trending-projects';
import type { FullProject } from '~/modules/projects/types/full-project';

export async function getProjectsForDashboard(
  sorting: DashboardSorting
): Promise<FullProject[]> {
  switch (sorting) {
    case DashboardSorting.Latest:
      return getLatestProjects();

    default:
      return getTrendingProjects();
  }
}
