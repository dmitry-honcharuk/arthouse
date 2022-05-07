import { prisma } from '~/db.server';

export async function countFavourites(projectId: string) {
  return prisma.favorite.count({
    where: { projectId },
  });
}
