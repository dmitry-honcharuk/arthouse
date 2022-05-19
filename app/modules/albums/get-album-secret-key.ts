import { z } from 'zod';

export function getAlbumSecretKey() {
  return z
    .string({ invalid_type_error: 'No album password key' })
    .length(32, 'Key should be 32 chars long')
    .parse(process.env.ALBUM_PASSWORD_KEY);
}
