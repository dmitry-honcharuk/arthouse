import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { addFavorite } from '~/modules/favorites/add-favorite';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { validateFormData } from '~/server/validate-form-data.server';

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== 'POST') {
    throw new Response(null, { status: 405 });
  }

  const formData = await request.formData();
  const currentUser = await getLoggedInUser(request);

  if (!currentUser) {
    throw new Response('Not Found', { status: 404 });
  }

  const { projectId: id } = validateFormData(
    formData,
    z.object({
      projectId: z.string(),
    })
  );

  return json(await addFavorite(currentUser.id, id));
};
