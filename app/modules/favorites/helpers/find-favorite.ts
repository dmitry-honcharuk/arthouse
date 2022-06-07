import type { Favorite } from '@prisma/client';
import type { WithProject } from '~/modules/projects/types/with-project';

type Props<T> = {
  projectId: string;
  favorites: T[];
};

export function findFavorite<T extends Favorite & WithProject>({
  projectId,
  favorites,
}: Props<T>): T | null {
  return favorites.find(({ project }) => project.id === projectId) ?? null;
}
