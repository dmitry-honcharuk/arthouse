import { prisma } from '~/db.server';
import { encrypt } from '~/modules/crypto/encrypt.server';
import { getProjectSecretKey } from '~/modules/projects/get-project-secret-key';

export async function setProjectPassword(projectId: string, password: string) {
  const secretKey = getProjectSecretKey();

  const { content, iv } = await encrypt(password, secretKey);

  return prisma.project.update({
    where: { id: projectId },
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
