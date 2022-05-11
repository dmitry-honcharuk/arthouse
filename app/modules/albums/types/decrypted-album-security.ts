import type { AlbumSecurity } from '@prisma/client';
import type { WithDecryptedPassword } from '~/modules/crypto/types/with-decrypted-password';

export type DecryptedAlbumSecurity = WithDecryptedPassword<AlbumSecurity>;
