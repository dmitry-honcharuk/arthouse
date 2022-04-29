import { Avatar } from '@mui/material';
import md5 from 'md5';
import * as React from 'react';
import type { FC } from 'react';
import { useMemo } from 'react';

export const GravatarAvatar: FC<{ email: string }> = ({ email }) => {
  const emailHash = useMemo(() => md5(email), [email]);

  return (
    <Avatar
      alt="picture"
      src={`https://www.gravatar.com/avatar/${emailHash}`}
    />
  );
};
