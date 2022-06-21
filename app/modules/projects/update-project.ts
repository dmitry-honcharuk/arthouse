import type { Project } from '@prisma/client';
import { prisma } from '~/db.server';

export async function updateProject(
  projectId: string,
  { status, preview, isSecure, name, slug, caption, explicit }: Partial<Project>
) {
  return prisma.project.update({
    where: { id: projectId },
    data: {
      status,
      name,
      slug,
      caption,
      isSecure,
      explicit,
      ...(typeof preview !== 'undefined' && preview === ''
        ? { preview: null }
        : { preview }),
    },
  });
}
