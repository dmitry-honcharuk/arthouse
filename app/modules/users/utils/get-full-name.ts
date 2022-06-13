import type { Profile } from '@prisma/client';

export function getFullName(
  profile: Pick<Profile, 'firstName' | 'lastName'>
): string | null {
  if (!profile.firstName && !profile.lastName) {
    return null;
  }

  return `${profile.firstName} ${profile.lastName}`.trim();
}
