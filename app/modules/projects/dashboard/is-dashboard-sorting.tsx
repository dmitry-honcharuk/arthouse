import { DashboardSorting } from '~/modules/projects/dashboard/dashboard-sorting';

export function isDashboardSorting(
  sorting: string
): sorting is DashboardSorting {
  return Object.values(DashboardSorting).includes(sorting as DashboardSorting);
}
