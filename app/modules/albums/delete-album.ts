import { prisma } from '~/db.server';

export async function deleteAlbum(albumId: string) {
  await prisma.album.delete({
    where: { id: albumId },
  });
}
