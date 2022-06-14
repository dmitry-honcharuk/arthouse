import {
  BadgeOutlined,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import type { Profile } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { castArray } from 'lodash';
import * as React from 'react';
import { z } from 'zod';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { ProfileDetailsSection } from '~/modules/users/components/profile/profile-details.section';
import { SocialSection } from '~/modules/users/components/profile/social.section';
import { SummarySection } from '~/modules/users/components/profile/summary.section';
import { UserLayout } from '~/modules/users/components/user-layout';
import { getUserPath } from '~/modules/users/get-user-path';
import { useUserOutletContext } from '~/modules/users/hooks/use-user-outlet-context';
import { updateProfile } from '~/modules/users/update-profile';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireSessionUser } from '~/server/require-session-user.server';

export const action: ActionFunction = async (actionDetails) => {
  return new ActionBuilder(actionDetails)
    .use('PUT', async ({ request }) => {
      const profileFields: Partial<Omit<Profile, 'id'>> = {};

      const user = await requireSessionUser(request);
      const formDataHandler = new FormDataHandler(request);

      const {
        fields: field,
        nickname,
        firstName,
        lastName,
        summary,
        socialLinks,
      } = await formDataHandler.validate(
        z.object({
          fields: z.union([z.string(), z.array(z.string())]),
          nickname: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
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

      if (fields.includes('nickname')) {
        profileFields.nickname = nickname || null;
      }

      if (fields.includes('firstName')) {
        profileFields.firstName = firstName || null;
      }

      if (fields.includes('lastName')) {
        profileFields.lastName = lastName || null;
      }

      return json(await updateProfile(user.id, profileFields));
    })
    .build();
};

export default function UserProfile() {
  const { user, isCurrentUser } = useUserOutletContext();

  return (
    <UserLayout
      breadcrumbs={
        <Breadcrumbs
          items={[
            {
              icon: <GridViewOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Browse',
              link: '/',
            },
            {
              icon: <PersonPin sx={{ mr: 0.5 }} fontSize="small" />,
              label: user.profile?.nickname ?? null,
              link: `/${getUserPath(user)}`,
            },
            {
              icon: <BadgeOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Profile',
            },
          ]}
        />
      }
    >
      <main className="flex flex-col gap-10">
        <ProfileDetailsSection
          editable={isCurrentUser}
          user={user}
          isCurrentUser={isCurrentUser}
        />
        <SummarySection editable={isCurrentUser} user={user} />
        <SocialSection editable={isCurrentUser} user={user} />
      </main>
    </UserLayout>
  );
}
