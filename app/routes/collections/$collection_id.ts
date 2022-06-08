import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { deleteCollection } from '~/modules/favorites/delete-collection';
import { getUserCollection } from '~/modules/favorites/get-user-collection';
import { updateCollection } from '~/modules/favorites/update-collection';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

export const action: ActionFunction = async (actionDetails) => {
  const { request, params } = actionDetails;

  const { collection_id: collectionId } = z
    .object({
      collection_id: z.string(),
    })
    .parse(params);

  const currentUser = await requireLoggedInUser(request);

  const collection = await getUserCollection(currentUser, collectionId);

  if (!collection) {
    throw new Response(null, { status: 401 });
  }

  return new ActionBuilder(actionDetails)
    .use('DELETE', async () => {
      return json(await deleteCollection(collection.id));
    })
    .use('PUT', async () => {
      const formDataHandler = new FormDataHandler(request);

      const { name } = await formDataHandler.validate(
        z.object({
          name: z.string(),
        })
      );

      return json(await updateCollection(collection.id, { name }));
    })
    .build();
};
