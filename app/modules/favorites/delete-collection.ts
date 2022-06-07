import { prisma } from '~/db.server';

export async function deleteCollection(id: string) {
  return prisma.collection.delete({
    where: { id },
  });
}
