import type { User } from '@prisma/client';
import { prisma } from '~/db.server';
import { getUserByIdentifier } from '../users/getUserById';

export async function getCollections(
  userIdentifier: string | Pick<User, 'id'>
) {
  const user =
    typeof userIdentifier === 'string'
      ? await getUserByIdentifier(userIdentifier)
      : userIdentifier;

  if (!user) {
    throw new Error(`Invalid user identifier ${userIdentifier}`);
  }

  return prisma.collection.findMany({
    where: { userId: user.id },
  });
}
