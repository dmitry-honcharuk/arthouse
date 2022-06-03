import { prisma } from '~/db.server';

export async function removeFollower({
  userId,
  followerId,
}: {
  userId: string;
  followerId: string;
}) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      followedBy: {
        disconnect: { id: followerId },
      },
    },
  });
}
