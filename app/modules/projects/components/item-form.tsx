import type { ProjectItem } from '@prisma/client';
import { ProjectItemType } from '@prisma/client';
import type { FC } from 'react';
import { ImageForm } from '~/modules/projects/components/img-form';
import { VideoLinkForm } from '~/modules/projects/components/video-link-form';

const { YOUTUBE, IMAGE } = ProjectItemType;

type Props = {
  type: ProjectItemType;
  onSuccess: () => void;
  onCancel?: () => void;
  item?: ProjectItem;
};

export const ItemForm: FC<Props> = ({ type, onSuccess, item }) => {
  switch (type) {
    case IMAGE:
      return <ImageForm onSuccess={onSuccess} item={item} />;

    case YOUTUBE:
      return <VideoLinkForm onSuccess={onSuccess} item={item} />;

    default:
      return null;
  }
};
