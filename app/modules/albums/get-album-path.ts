import type { Album } from '@prisma/client';
import { getUserPath } from '../users/get-user-path';
import type { UserWithProfile } from '../users/types/user-with-profile';

export function getAlbumPath(
  album: Pick<Album, 'id' | 'slug'>,
  user: UserWithProfile
) {
  return `${getUserPath(user)}/albums/${album.slug ?? album.id}`;
}
