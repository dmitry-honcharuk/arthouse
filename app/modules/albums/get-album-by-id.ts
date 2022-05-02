import { prisma } from '~/db.server';

export async function getAlbumById(albumId: string) {
  return prisma.album.findUnique({
    where: {
      id: albumId,
    },
    include: {
      projects: {
        include: {
          user: {
            include: { profile: true },
          },
        },
      },
      user: {
        include: { profile: true },
      },
    },
  });
}
