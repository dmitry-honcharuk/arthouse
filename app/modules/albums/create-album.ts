import type { Album } from '@prisma/client';
import { prisma } from '~/db.server';

interface Details extends Pick<Album, 'name' | 'userId' | 'slug'> {
  projectIds?: string[];
}

export async function createAlbum({ userId, name, slug, projectIds }: Details) {
  return prisma.album.create({
    data: {
      name,
      slug,
      user: {
        connect: { id: userId },
      },
      projects: {
        connect: projectIds?.map((id) => ({ id })) ?? [],
      },
    },
  });
}
