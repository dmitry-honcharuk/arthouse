import type { Favorite } from '@prisma/client';
import type { WithProject } from '~/modules/projects/types/with-project';

type Props = {
  projectId: string;
  favorites: (Favorite & WithProject)[];
};

export function isFavorite({ projectId, favorites }: Props): boolean {
  return !!favorites.find(({ project }) => project.id === projectId);
}
