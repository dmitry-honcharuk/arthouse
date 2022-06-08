import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { createCollection } from '~/modules/favorites/create-collection';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

export const action: ActionFunction = async (actionDetails) => {
  const currentUser = await requireLoggedInUser(actionDetails.request);
  const formDataHandler = new FormDataHandler(actionDetails.request);

  return new ActionBuilder(actionDetails)
    .use('POST', async () => {
      const { name } = await formDataHandler.validate(
        z.object({ name: z.string() })
      );

      return json(
        await createCollection({
          userId: currentUser.id,
          name,
        })
      );
    })
    .build();
};
