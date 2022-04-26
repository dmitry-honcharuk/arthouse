import type { ProjectItem } from '@prisma/client';
import { prisma } from '~/db.server';

export async function createProjectItem(
  projectId: string,
  details: Omit<ProjectItem, 'id' | 'projectId'>
) {
  const { type, value, title, caption } = details;

  return prisma.projectItem.create({
    data: {
      type,
      value,
      title,
      caption,
      projectId: projectId,
    },
  });
}
