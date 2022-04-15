import { MailOutline } from '@mui/icons-material';
import { TextField } from '@mui/material';
import type { User } from '@prisma/client';
import type { FC } from 'react';
import { ProfileSection } from '~/modules/users/components/profile/profile-section';
import { SectionTitle } from '~/modules/users/components/profile/section-title';

export const ProfileDetailsSection: FC<{
  user: User;
  editable: boolean;
}> = ({ editable, user }) => {
  return (
    <ProfileSection
      renderTitle={({ isEdit, setIsEdit }) => (
        <SectionTitle
          variant="h3"
          onEdit={editable ? () => setIsEdit((edit) => !edit) : null}
          isEdit={isEdit}
        >
          Profile
        </SectionTitle>
      )}
      render={({ isEdit }) => (
        <div className="flex items-center gap-4">
          <MailOutline />
          {isEdit ? (
            <TextField
              fullWidth
              label="Email"
              size="small"
              name="outlined-basic"
              variant="outlined"
              defaultValue={user.email}
              autoFocus
              disabled
              helperText="You cannot change your email"
            />
          ) : (
            <a href={`mailto:${user.email}`}>
              <span className="underline">{user.email}</span>
            </a>
          )}
        </div>
      )}
    />
  );
};
