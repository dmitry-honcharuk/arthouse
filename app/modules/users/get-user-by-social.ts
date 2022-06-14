import type { User } from '@prisma/client';
import { prisma } from '~/db.server';
import { SocialProvider } from '~/modules/auth/types/social-provider';

type Details = {
  email: string;
  firstName?: string;
  lastName?: string;
  social: {
    id: string;
    provider: SocialProvider;
  };
};

export async function getUserBySocial({
  email,
  social,
  firstName,
  lastName,
}: Details) {
  const socialIdField = getSocialProviderIdField(social.provider);

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email, [socialIdField]: social.id },
        { email, [socialIdField]: null },
      ],
    },
    include: { profile: true },
  });

  if (!user) {
    return prisma.user.create({
      data: {
        email,
        [socialIdField]: social.id,
        profile: {
          create: {
            firstName,
            lastName,
          },
        },
      },
      include: { profile: true },
    });
  }

  if (!user[socialIdField]) {
    return prisma.user.update({
      where: { id: user.id },
      data: { [socialIdField]: social.id },
      include: { profile: true },
    });
  }

  return user;
}

function getSocialProviderIdField(
  provider: SocialProvider
): keyof Pick<User, 'googleId' | 'facebookId'> {
  if (provider === SocialProvider.Google) {
    return 'googleId';
  }

  if (provider === SocialProvider.Facebook) {
    return 'facebookId';
  }

  throw new Error(`No social id field for provider ${provider}`);
}

export function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: { profile: true },
  });
}

export function createUser(email: string) {
  return prisma.user.create({
    data: { email },
  });
}
