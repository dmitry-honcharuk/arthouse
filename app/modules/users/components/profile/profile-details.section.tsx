import { LocalOfferOutlined, MailOutline } from '@mui/icons-material';
import { Button, TextField, Typography } from '@mui/material';
import type { Profile } from '@prisma/client';
import { Form, useActionData, useNavigate } from '@remix-run/react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { EditableCardSection } from '~/modules/common/editable-card-section';
import { SectionTitle } from '~/modules/users/components/profile/section-title';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getURI } from '../../../common/utils/getURI';
import { NicknameTag } from './nickname-tag';
import * as React from 'react';

export const ProfileDetailsSection: FC<{
  user: UserWithProfile;
  editable: boolean;
  isCurrentUser: boolean;
}> = ({ editable, user, isCurrentUser }) => {
  const [nickname, setNickname] = useState(user.profile?.nickname);
  const [firstName, setFirstName] = useState(user.profile?.firstName);
  const [lastName, setLastName] = useState(user.profile?.lastName);
  const navigate = useNavigate();
  const profile = useActionData<Profile>();
  const nameLabel = <span className="text-xs font-bold self-center">FN</span>;
  const lastNameLabel = (
    <span className="text-xs font-bold self-center">LN</span>
  );

  useEffect(() => {
    if (!profile) {
      return;
    }

    if (!profile.nickname) {
      navigate(`/${user.id}/profile`);
      return;
    }

    if (user.profile?.nickname !== profile.nickname) {
      navigate(`/${profile.nickname}/profile`);
    }
  }, [navigate, profile, profile?.nickname, user.id, user.profile?.nickname]);

  return (
    <EditableCardSection
      renderTitle={({ isEdit, setIsEdit }) => (
        <SectionTitle
          onEdit={editable ? () => setIsEdit((edit) => !edit) : null}
          isEdit={isEdit}
        >
          Profile
        </SectionTitle>
      )}
      render={({ isEdit, setIsEdit }) => (
        <div className="flex flex-col gap-8">
          <div className="flex items-start gap-4">
            {nameLabel}
            {isEdit ? (
              <Form
                onSubmit={() => setIsEdit(false)}
                className="flex items-start gap-4 grow"
                method="put"
              >
                <input type="hidden" name="fields" value="firstName" />
                <input type="hidden" name="firstName" value={firstName ?? ''} />

                <TextField
                  label="First Name"
                  size="small"
                  variant="outlined"
                  defaultValue={firstName}
                  onChange={({ target }) => setFirstName(target.value)}
                />
              </Form>
            ) : (
              firstName
            )}
          </div>
          <div className="flex items-start gap-4">
            {lastNameLabel}
            {isEdit ? (
              <Form
                onSubmit={() => setIsEdit(false)}
                className="flex items-start gap-4 grow"
                method="put"
              >
                <input type="hidden" name="fields" value="lastName" />
                <input type="hidden" name="lastName" value={lastName ?? ''} />

                <TextField
                  label="Last Name"
                  size="small"
                  variant="outlined"
                  defaultValue={lastName}
                  onChange={({ target }) => setLastName(target.value)}
                />
              </Form>
            ) : (
              lastName
            )}
          </div>
          <div className="flex items-start gap-4">
            <MailOutline />
            {isEdit ? (
              <TextField
                fullWidth
                label="Email"
                size="small"
                name="email"
                variant="outlined"
                defaultValue={user.email}
                disabled
                helperText="You cannot change your email"
              />
            ) : (
              <a href={`mailto:${user.email}`}>
                <span className="underline">{user.email}</span>
              </a>
            )}
          </div>
          <div className="flex items-start gap-4">
            <LocalOfferOutlined
              color={user.profile?.nickname ? 'inherit' : 'disabled'}
            />
            {isEdit ? (
              <Form
                onSubmit={() => setIsEdit(false)}
                className="flex items-start gap-4 grow"
                method="put"
              >
                <input type="hidden" name="fields" value="nickname" />
                <input type="hidden" name="nickname" value={nickname ?? ''} />

                <TextField
                  className="grow"
                  fullWidth
                  label="Nickname"
                  size="small"
                  variant="outlined"
                  defaultValue={nickname}
                  onChange={({ target }) => setNickname(getURI(target.value))}
                  helperText={
                    <span className="flex flex-col gap-1 items-start">
                      <span>
                        Your personal page could be accessed by the nickname
                      </span>
                      {nickname && <NicknameTag nickname={nickname} />}
                    </span>
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  autoFocus
                />
                <Button type="submit" size="small" variant="outlined">
                  Save
                </Button>
              </Form>
            ) : nickname ? (
              <span className="flex flex-col gap-1 items-start">
                <NicknameTag nickname={nickname} isLink />

                <Typography variant="caption">
                  {isCurrentUser
                    ? 'Your personal page could be accessed by the nickname'
                    : 'User personal page could be accessed by the nickname'}
                </Typography>
              </span>
            ) : (
              "You didn't specify your nickname yet"
            )}
          </div>
        </div>
      )}
    />
  );
};
