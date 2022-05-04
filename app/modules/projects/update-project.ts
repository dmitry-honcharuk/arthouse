import type { Project } from '@prisma/client';
import { prisma } from '~/db.server';

export async function updateProject(
  projectId: string,
  { status, preview, isSecure }: Partial<Project>
) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      status,
      isSecure,
      ...(typeof preview !== 'undefined' && preview === ''
        ? { preview: null }
        : { preview }),
    },
  });
}
