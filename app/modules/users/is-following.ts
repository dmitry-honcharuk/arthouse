import { prisma } from '~/db.server';

export async function isFollowing({
  userId,
  followerId,
}: {
  userId: string;
  followerId: string;
}): Promise<boolean> {
  const following = await prisma.user.count({
    where: {
      id: userId,
      followedBy: { some: { id: followerId } },
    },
  });

  return !!following;
}
