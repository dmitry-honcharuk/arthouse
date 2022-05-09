import type { ProjectItem } from '@prisma/client';
import { ProjectItemType } from '@prisma/client';
import type { FC } from 'react';
import { ImageForm } from '~/modules/projects/components/img-form';
import { VideoLinkForm } from '~/modules/projects/components/video-link-form';
import { getProjectPath } from '~/modules/projects/get-project-path';
import type { FullProject } from '~/modules/projects/types/full-project';

const { YOUTUBE, IMAGE } = ProjectItemType;

type Props = {
  project: FullProject;
  type: ProjectItemType;
  onSuccess: () => void;
  onCancel?: () => void;
  item?: ProjectItem;
  updateLink?: string;
};

export const ItemForm: FC<Props> = ({ type, onSuccess, item, project }) => {
  const projectPath = `/${getProjectPath(project, project.user)}`;
  const path = item ? `${projectPath}/${item.id}` : `${projectPath}/?index`;

  switch (type) {
    case IMAGE:
      return <ImageForm onSuccess={onSuccess} item={item} action={path} />;

    case YOUTUBE:
      return <VideoLinkForm onSuccess={onSuccess} item={item} action={path} />;

    default:
      return null;
  }
};
