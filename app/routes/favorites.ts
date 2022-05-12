import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { addFavorite } from '~/modules/favorites/add-favorite';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const action: ActionFunction = async (actionDetails) => {
  return new ActionBuilder(actionDetails)
    .use('POST', async ({ request }) => {
      const formDataHandler = new FormDataHandler(request);

      const currentUser = await getLoggedInUser(request);

      if (!currentUser) {
        throw new Response('Not Found', { status: 404 });
      }

      const { projectId: id } = await formDataHandler.validate(
        z.object({
          projectId: z.string(),
        })
      );

      return json(await addFavorite(currentUser.id, id));
    })
    .build();
};
