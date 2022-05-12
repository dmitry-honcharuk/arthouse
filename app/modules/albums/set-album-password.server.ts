import { z } from 'zod';
import { prisma } from '~/db.server';
import { encrypt } from '~/modules/crypto/encrypt.server';

export async function setAlbumPassword(albumId: string, password: string) {
  const secretKey = z.string().parse(process.env.PROJECT_PASSWORD_KEY);

  const { content, iv } = await encrypt(password, secretKey);

  return prisma.album.update({
    where: { id: albumId },
    data: {
      security: {
        upsert: {
          update: {
            passwordHash: content,
            passwordIv: iv,
            passwordVersion: { increment: 1 },
          },
          create: { passwordHash: content, passwordIv: iv },
        },
      },
    },
  });
}
