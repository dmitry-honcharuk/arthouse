import { prisma } from '~/db.server';

export async function addFollower({
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
        connect: { id: followerId },
      },
    },
  });
}
