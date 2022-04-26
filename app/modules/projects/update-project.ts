import type { Project } from '@prisma/client';
import { prisma } from '~/db.server';

export async function updateProject(
  projectId: string,
  { status, preview }: Partial<Project>
) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      status,
      ...(typeof preview !== 'undefined' && preview === ''
        ? { preview: null }
        : { preview }),
    },
  });
}
