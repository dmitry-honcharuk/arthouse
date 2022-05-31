import { EditOffOutlined, ModeEditOutlined } from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material';
import type { FC, ReactNode } from 'react';
import * as React from 'react';
import { TogglableContent } from '~/modules/common/togglable-content';

interface Props {
  title?: ReactNode;
  isCurrentUser: boolean;
  children: (d: { isEdit: boolean; toggle: () => void }) => ReactNode;
}

export const SidebarCardContent: FC<Props> = ({
  title,
  isCurrentUser,
  children,
}) => {
  return (
    <TogglableContent>
      {({ isEnabled: isEdit, toggle }) => (
        <>
          <Typography component="h5" gutterBottom variant="overline">
            <Stack
              direction="row"
              justifyContent={title ? 'space-between' : 'flex-end'}
            >
              {title}
              {isCurrentUser && (
                <IconButton onClick={toggle} size="small">
                  {isEdit ? (
                    <EditOffOutlined fontSize="small" />
                  ) : (
                    <ModeEditOutlined fontSize="small" />
                  )}
                </IconButton>
              )}
            </Stack>
          </Typography>
          {children({ isEdit, toggle })}
        </>
      )}
    </TogglableContent>
  );
};
