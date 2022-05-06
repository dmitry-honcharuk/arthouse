import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { addFavorite } from '~/modules/favorites/add-favorite';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { z } from 'zod';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const currentUser = await getLoggedInUser(request);

  if (!currentUser) {
    throw new Response('Not Found', { status: 404 });
  }

  if (request.method === 'POST') {
    const projectId = formData.get('projectId');
    const { projectId: id } = z
      .object({
        projectId: z.string(),
      })
      .parse({ projectId });

    return json(await addFavorite(currentUser.id, id));
  }

  return json({});
};
