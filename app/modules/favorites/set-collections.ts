import { prisma } from '~/db.server';

export function setCollections({
  projectId,
  userId,
  collectionIds,
}: {
  userId: string;
  projectId: string;
  collectionIds: string[];
}) {
  return prisma.favorite.update({
    where: { projectId_userId: { projectId, userId } },
    data: {
      collections: { set: collectionIds.map((id) => ({ id })) },
    },
  });
}
