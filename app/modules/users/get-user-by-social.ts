import type { User } from '@prisma/client';
import { prisma } from '~/db.server';
import { SocialProvider } from '~/modules/auth/types/social-provider';

type Details = {
  email: string;
  social: {
    id: string;
    provider: SocialProvider;
  };
};

export async function getUserBySocial({
  email,
  social,
}: Details): Promise<User> {
  const socialIdField = getSocialProviderIdField(social.provider);

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email, [socialIdField]: social.id },
        { email, [socialIdField]: null },
      ],
    },
  });

  if (!user) {
    return prisma.user.create({
      data: {
        email,
        [socialIdField]: social.id,
      },
    });
  }

  if (!user[socialIdField]) {
    return prisma.user.update({
      where: { id: user.id },
      data: { [socialIdField]: social.id },
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
