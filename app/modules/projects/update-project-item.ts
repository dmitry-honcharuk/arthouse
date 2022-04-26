import type { ProjectItem } from '@prisma/client';
import { prisma } from '~/db.server';

export async function updateProjectItem(
  itemId: string,
  details: Partial<ProjectItem>
) {
  await prisma.projectItem.update({
    where: {
      id: itemId,
    },
    data: {
      value: details.value,
      title: details.title,
      caption: details.caption,
    },
  });
}
