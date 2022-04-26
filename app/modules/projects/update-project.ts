import type { Project } from '@prisma/client';
import { prisma } from '~/db.server';

export async function updateProject(
  projectId: string,
  details: Pick<Project, 'status'>
) {
  return await prisma.project.update({
    where: { id: projectId },
    data: { status: details.status },
  });
}
