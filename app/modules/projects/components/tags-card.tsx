import {
  EditOffOutlined,
  ModeEditOutlined,
  TagOutlined,
} from '@mui/icons-material';
import { IconButton, Stack, Typography } from '@mui/material';
import type { Project } from '@prisma/client';
import type { FC } from 'react';
import * as React from 'react';
import { TogglableContent } from '~/modules/common/togglable-content';
import { ProjectTagsForm } from '~/modules/projects/components/project-tags-form';
import type { WithTags } from '~/modules/tags/types/with-tags';

export const TagsCard: FC<{
  project: Project & WithTags;
  action: string;
  isCurrentUser: boolean;
}> = ({ project, action, isCurrentUser }) => {
  return (
    <TogglableContent>
      {({ isEnabled: isEdit, toggle }) => (
        <>
          <Typography component="h5" gutterBottom variant="overline">
            <Stack direction="row" justifyContent="space-between">
              <span>
                <TagOutlined fontSize="small" /> <span>Tags</span>
              </span>
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
          <ProjectTagsForm
            project={project}
            action={action}
            isCurrentUser={isCurrentUser}
            isEdit={isEdit}
          />
        </>
      )}
    </TogglableContent>
  );
};
