import type { Project } from '@prisma/client';
import { prisma } from '~/db.server';

interface Details extends Pick<Project, 'name' | 'caption' | 'slug'> {
  categories?: number[];
}

export async function createProject(userId: string, details: Details) {
  return prisma.project.create({
    data: {
      userId,
      name: details.name,
      caption: details.caption,
      slug: details.slug,
      categories: {
        connect: details.categories?.map((id) => ({ id })),
      },
    },
  });
}
