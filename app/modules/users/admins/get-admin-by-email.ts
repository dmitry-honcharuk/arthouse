import { prisma } from '~/db.server';

export function getAdminByEmail(email: string) {
  return prisma.admin.findFirst({
    where: {
      user: { email },
    },
    include: {
      user: { include: { profile: true } },
      roles: true,
    },
  });
}
