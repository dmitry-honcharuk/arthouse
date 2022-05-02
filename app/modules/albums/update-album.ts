import type { Album } from '@prisma/client';
import { prisma } from '~/db.server';

export interface Details extends Partial<Omit<Album, 'id' | 'userId'>> {
  projectIds?: string[];
}

export async function updateAlbum(
  albumId: string,
  { projectIds, name }: Details
) {
  return prisma.album.update({
    where: { id: albumId },
    data: {
      name,
      projects: {
        set: projectIds?.map((id) => ({ id })),
      },
    },
  });
}
