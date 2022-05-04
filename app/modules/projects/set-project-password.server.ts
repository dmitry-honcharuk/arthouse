import { z } from 'zod';
import { prisma } from '~/db.server';
import { encrypt } from '~/modules/crypto/encrypt.server';

export async function setProjectPassword(projectId: string, password: string) {
  const secretKey = z.string().parse(process.env.PROJECT_PASSWORD_KEY);

  const { content, iv } = await encrypt(password, secretKey);

  return prisma.project.update({
    where: { id: projectId },
    data: {
      projectSecurity: {
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
