import { prisma } from '~/db.server';
import { getUserByIdentifier } from '~/modules/users/getUserById';

export async function getUserAlbums(
  userId: string,
  details?: {
    albums?: {
      isSecure?: boolean;
    };
    project?: {
      isSecure?: boolean;
      explicit?: boolean;
    };
  }
) {
  const user = await getUserByIdentifier(userId);

  if (!user) {
    throw new Error(`Invalid user ID: ${userId}`);
  }

  console.log('details?.project?.explicit', details?.project?.explicit);

  return await prisma.album.findMany({
    where: {
      userId: user.id,
      isSecure: details?.albums?.isSecure,
    },
    include: {
      projects: {
        where: {
          isSecure: details?.project?.isSecure,
          explicit: details?.project?.explicit,
        },
        include: { user: { include: { profile: true } } },
      },
      user: { include: { profile: true } },
    },
  });
}
