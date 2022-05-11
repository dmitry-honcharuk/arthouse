import type { User } from '@prisma/client';
import { validate } from 'uuid';
import { prisma } from '~/db.server';
import { getUserByIdentifier } from '../users/getUserById';

export async function getUserAlbum(
  userIdentifier: string | Pick<User, 'id'>,
  albumIdentifier: string
) {
  const user =
    typeof userIdentifier === 'string'
      ? await getUserByIdentifier(userIdentifier)
      : userIdentifier;

  if (!user) {
    throw new Error(`Invalid user identifier ${userIdentifier}`);
  }

  const isUUID = validate(albumIdentifier);

  return prisma.album.findFirst({
    where: {
      userId: user.id,
      ...(isUUID ? { id: albumIdentifier } : { slug: albumIdentifier }),
    },
    include: {
      security: true,
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
