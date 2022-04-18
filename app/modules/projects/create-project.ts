import type { Project } from '@prisma/client';
import { prisma } from '~/db.server';

export async function createProject(
  userId: string,
  details: Pick<Project, 'name' | 'caption' | 'slug'>
) {
  return prisma.project.create({
    data: {
      userId,
      name: details.name,
      caption: details.caption,
      slug: details.slug,
    },
  });
}
