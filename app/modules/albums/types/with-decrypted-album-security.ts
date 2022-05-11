import type { DecryptedAlbumSecurity } from '~/modules/albums/types/decrypted-album-security';

export interface WithDecryptedAlbumSecurity {
  security: DecryptedAlbumSecurity | null;
}
