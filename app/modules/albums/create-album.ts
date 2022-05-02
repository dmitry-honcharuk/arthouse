import type { Album } from '@prisma/client';
import { prisma } from '~/db.server';

interface Details extends Pick<Album, 'name' | 'userId'> {
  projectIds?: string[];
}

export async function createAlbum({ userId, name, projectIds }: Details) {
  return prisma.album.create({
    data: {
      name,
      user: {
        connect: { id: userId },
      },
      projects: {
        connect: projectIds?.map((id) => ({ id })) ?? [],
      },
    },
  });
}
