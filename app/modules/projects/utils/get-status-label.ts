import { ProjectStatus } from '@prisma/client';

export function getStatusLabel(status: ProjectStatus): string {
  const label =
    status === ProjectStatus.PUBLISHED ? 'released' : ProjectStatus.DRAFT;

  return label.toLowerCase();
}
