import type { FC } from 'react';
import { ProfileSection } from '~/modules/users/components/profile/profile-section';
import { SectionTitle } from '~/modules/users/components/profile/section-title';
import { SocialLinksDisplay } from '~/modules/users/components/profile/social-links-display';
import { SocialLinksEdit } from '~/modules/users/components/profile/social-links-edit';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';

export const SocialSection: FC<{
  user: UserWithProfile;
  editable: boolean;
}> = ({ editable, user }) => {
  return (
    <ProfileSection
      renderTitle={({ isEdit, setIsEdit }) => (
        <SectionTitle
          onEdit={editable ? () => setIsEdit((edit) => !edit) : null}
          isEdit={isEdit}
        >
          Social Links
        </SectionTitle>
      )}
      render={({ isEdit, setIsEdit }) =>
        isEdit ? (
          <SocialLinksEdit
            links={user.profile?.socialLinks ?? []}
            onSuccess={() => setIsEdit(false)}
          />
        ) : (
          <SocialLinksDisplay user={user} />
        )
      }
    />
  );
};
