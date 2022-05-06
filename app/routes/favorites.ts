import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { addFavorite } from '~/modules/favorites/add-favorite';
import { validateFormData } from '~/modules/validation/validate-form-data';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { z } from 'zod';

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
