import { Button, TextField } from '@mui/material';
import { Form } from '@remix-run/react';
import type { FC } from 'react';
import { EditableCardSection } from '~/modules/common/editable-card-section';
import { SectionTitle } from '~/modules/users/components/profile/section-title';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';

export const SummarySection: FC<{
  user: UserWithProfile;
  editable: boolean;
}> = ({ editable, user }) => {
  return (
    <EditableCardSection
      renderTitle={({ isEdit, setIsEdit }) => (
        <SectionTitle
          onEdit={editable ? () => setIsEdit((edit) => !edit) : null}
          isEdit={isEdit}
        >
          Summary
        </SectionTitle>
      )}
      render={({ isEdit, setIsEdit }) =>
        isEdit ? (
          <Form
            method="put"
            className="flex flex-col gap-2"
            onSubmit={() => setIsEdit(false)}
          >
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
