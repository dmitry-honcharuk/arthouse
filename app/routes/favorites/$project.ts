import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { deleteFavorite } from '~/modules/favorites/delete-favorite';

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== 'DELETE') {
    throw new Response(null, { status: 405 });
  }

  const { project: projectId } = z
    .object({
      project: z.string(),
    })
    .parse(params);

  const currentUser = await getLoggedInUser(request);

  if (!currentUser) {
    throw new Response('Not Found', { status: 404 });
  }

  return json(await deleteFavorite(currentUser.id, projectId));
};
