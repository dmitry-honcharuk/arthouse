import type { Collection } from '@prisma/client';
import { prisma } from '~/db.server';

export async function updateCollection(
  id: string,
  details: Pick<Collection, 'name'>
) {
  return prisma.collection.update({
    where: { id },
    data: { name: details.name },
  });
}
