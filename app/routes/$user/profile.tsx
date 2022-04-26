import type { Profile } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useOutletContext } from '@remix-run/react';
import { castArray } from 'lodash';
import * as React from 'react';
import { z } from 'zod';
import { ProfileDetailsSection } from '~/modules/users/components/profile/profile-details.section';
import { SocialSection } from '~/modules/users/components/profile/social.section';
import { SummarySection } from '~/modules/users/components/profile/summary.section';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { updateProfile } from '~/modules/users/update-profile';
import { validateFormData } from '~/modules/validation/validate-form-data';
import { requireUser } from '~/server/require-user.server';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const user = await requireUser(request);

  const profileFields: Partial<Omit<Profile, 'id'>> = {};

  const {
    fields: field,
    nickname,
    summary,
    socialLinks,
  } = validateFormData(
    formData,
    z.object({
      fields: z.union([z.string(), z.array(z.string())]),
      nickname: z.string().optional(),
      summary: z.string().optional(),
      socialLinks: z.union([z.string(), z.array(z.string())]).optional(),
    })
  );

  const fields = castArray(field);

  if (fields.includes('summary') && summary) {
    profileFields.summary = summary;
  }

  if (fields.includes('socialLinks')) {
    profileFields.socialLinks = socialLinks ? castArray(socialLinks) : [];
  }

  if (fields.includes('nickname') && nickname) {
    profileFields.nickname = nickname;
  }

  return json(await updateProfile(user.id, profileFields));
};

export default function UserProfile() {
  const { user, isCurrentUser } = useOutletContext<{
    user: UserWithProfile;
    isCurrentUser: boolean;
  }>();

  return (
    <main className="flex flex-col gap-10">
      <ProfileDetailsSection
        editable={isCurrentUser}
        user={user}
        isCurrentUser={isCurrentUser}
      />
      <SummarySection editable={isCurrentUser} user={user} />
      <SocialSection editable={isCurrentUser} user={user} />
    </main>
  );
}
