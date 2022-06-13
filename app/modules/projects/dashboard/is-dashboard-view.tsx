import { DashboardView } from '~/modules/projects/dashboard/dashboard-view';

export function isDashboardView(sorting: string): sorting is DashboardView {
  return Object.values(DashboardView).includes(sorting as DashboardView);
}
