import { Button, TextField } from '@mui/material';
import { Form } from '@remix-run/react';
import type { FC } from 'react';
import { ProfileSection } from '~/modules/users/components/profile/profile-section';
import { SectionTitle } from '~/modules/users/components/profile/section-title';
import type { UserWithProfile } from '~/modules/users/types/social-user';

export const SummarySection: FC<{
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
          Summary
        </SectionTitle>
      )}
      render={({ isEdit }) =>
        isEdit ? (
          <Form method="post" className="flex flex-col gap-2">
            <input type="hidden" name="fields" value="summary" />
            <TextField
              multiline
              fullWidth
              size="small"
              name="summary"
              variant="outlined"
              defaultValue={user.profile?.summary}
              autoFocus
            />
            <Button type="submit" variant="contained" className="self-end">
              Save
            </Button>
          </Form>
        ) : (
          <>{user.profile?.summary ?? 'No summary yet'}</>
        )
      }
    />
  );
};
