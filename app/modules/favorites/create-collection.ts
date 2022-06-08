import { prisma } from '~/db.server';

export function createCollection({
  name,
  userId,
}: {
  userId: string;
  name: string;
}) {
  return prisma.collection.create({
    data: {
      userId,
      name,
    },
  });
}
