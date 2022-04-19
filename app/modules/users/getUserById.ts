import { validate } from 'uuid';
import { prisma } from '~/db.server';

export async function getUserByIdentifier(id: string) {
  const isId = validate(id);

  if (isId) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  }

  const profile = await prisma.profile.findUnique({
    where: { nickname: id },
    include: {
      user: {
        include: { profile: true },
      },
    },
  });

  return profile?.user ?? null;
}
