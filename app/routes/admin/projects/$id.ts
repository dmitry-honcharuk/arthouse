import { Permission } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { prisma } from '~/db.server';
import { ActionBuilder } from '~/server/action-builder.server';

export const loader: LoaderFunction = async (data) => {
  return new ActionBuilder(data)
    .allow([Permission.SUPER])
    .use('GET', async ({ params }) => {
      const { id } = z.object({ id: z.string().uuid() }).parse(params);

      return json(
        await prisma.project.findUnique({
          where: {
            id,
          },
          include: { user: true },
        })
      );
    })
    .build();
};
