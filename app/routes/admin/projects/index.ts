import { Permission } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { prisma } from '~/db.server';
import { ActionBuilder } from '~/server/action-builder.server';

export const loader: LoaderFunction = async (data) => {
  return new ActionBuilder(data)
    .allow([Permission.SUPER])
    .use('GET', async () => {
      return json(
        await prisma.project.findMany({
          include: { user: true },
        })
      );
    })
    .build();
};
