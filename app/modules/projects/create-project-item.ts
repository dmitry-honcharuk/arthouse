import type { ProjectItem } from '@prisma/client';
import { prisma } from '~/db.server';

export async function createProjectItem(details: Omit<ProjectItem, 'id'>) {
  return prisma.projectItem.create({
    data: {
      type: details.type,
      value: details.value,
      title: details.title,
      caption: details.caption,
      projectId: details.projectId,
    },
  });
}
