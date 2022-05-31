import { TagOutlined } from '@mui/icons-material';
import type { Project } from '@prisma/client';
import type { FC } from 'react';
import * as React from 'react';
import { ProjectTagsForm } from '~/modules/projects/components/project-tags-form';
import { SidebarCardContent } from '~/modules/projects/components/sidebar-card-content';
import type { WithTags } from '~/modules/tags/types/with-tags';

export const TagsCard: FC<{
  project: Project & WithTags;
  action: string;
  isCurrentUser: boolean;
}> = ({ project, action, isCurrentUser }) => {
  return (
    <SidebarCardContent
      isCurrentUser={isCurrentUser}
      title={
        <span>
          <TagOutlined fontSize="small" /> <span>Tags</span>
        </span>
      }
    >
      {({ isEdit }) => (
        <ProjectTagsForm
          project={project}
          action={action}
          isCurrentUser={isCurrentUser}
          isEdit={isEdit}
        />
      )}
    </SidebarCardContent>
  );
};
