import { prisma } from '~/db.server';
import { getUserByIdentifier } from '~/modules/users/getUserById';

export async function getUserAlbums(
  userId: string,
  projectDetails?: {
    isSecure?: boolean;
  }
) {
  const user = await getUserByIdentifier(userId);

  if (!user) {
    throw new Error(`Invalid user ID: ${userId}`);
  }

  return await prisma.album.findMany({
    where: { userId: user.id },
    include: {
      projects: {
        where: { isSecure: projectDetails?.isSecure },
        include: { user: { include: { profile: true } } },
      },
      user: { include: { profile: true } },
    },
  });
}
