import { Permission } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/db.server';
import { ActionBuilder } from '~/server/action-builder.server';

export const loader: LoaderFunction = async (data) => {
  return new ActionBuilder(data)
    .allow([Permission.SUPER, Permission.USERS_LIST])
    .use('GET', async () => {
      return json(
        await prisma.user.findMany({
          include: { profile: true, admin: true },
        })
      );
    })
    .build();
};
