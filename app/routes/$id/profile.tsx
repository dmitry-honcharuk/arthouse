import type { Profile } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useOutletContext } from '@remix-run/react';
import * as React from 'react';
import { ProfileDetailsSection } from '~/modules/users/components/profile/profile-details.section';
import { SocialSection } from '~/modules/users/components/profile/social.section';
import { SummarySection } from '~/modules/users/components/profile/summary.section';
import type { ProfileFields } from '~/modules/users/components/profile/types/profile-fields';
import type { UserWithProfile } from '~/modules/users/types/social-user';
import { updateProfile } from '~/modules/users/update-profile';
import { requireUser } from '~/server/require-user';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const user = await requireUser(request);

  const fields = formData
    .getAll('fields')
    .map((field) => field.toString()) as ProfileFields[];

  const profileFields: Partial<Omit<Profile, 'id'>> = {};

  const summary = formData.get('summary');
  const socialLinks = formData.getAll('socialLinks');

  if (fields.includes('summary') && typeof summary === 'string') {
    profileFields.summary = summary;
  }

  if (
    fields.includes('socialLinks') &&
    socialLinks.every((link): link is string => typeof link === 'string')
  ) {
    profileFields.socialLinks = socialLinks;
  }

  return json(await updateProfile(user.id, profileFields));
};

export default function UserProfile() {
  const { user, isCurrentUser } = useOutletContext<{
    user: UserWithProfile;
    isCurrentUser: boolean;
  }>();

  return (
    <main className="flex flex-col gap-10 pt-16">
      <ProfileDetailsSection editable={isCurrentUser} user={user} />
      <SummarySection editable={isCurrentUser} user={user} />
      <SocialSection editable={isCurrentUser} user={user} />
    </main>
  );
}
