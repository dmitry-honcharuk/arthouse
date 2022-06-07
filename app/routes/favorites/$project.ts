import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { castArray } from 'lodash';
import { z } from 'zod';
import { deleteFavorite } from '~/modules/favorites/delete-favorite';
import { setCollections } from '~/modules/favorites/set-collections';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

export const action: ActionFunction = async (actionDetails) => {
  const { request, params } = actionDetails;

  const { project: projectId } = z
    .object({
      project: z.string(),
    })
    .parse(params);

  const currentUser = await requireLoggedInUser(request);

  return new ActionBuilder(actionDetails)
    .use('DELETE', async () => {
      return json(await deleteFavorite(currentUser.id, projectId));
    })
    .use('PUT', async () => {
      const formDataHandler = new FormDataHandler(request);

      const { fields: field, collections } = await formDataHandler.validate(
        z.object({
          fields: z.union([z.string(), z.array(z.string())]),
          collections: z.union([z.string(), z.array(z.string())]).optional(),
        })
      );

      const fields = castArray(field);

      if (fields.includes('collections')) {
        return json(
          await setCollections({
            projectId,
            userId: currentUser.id,
            collectionIds: collections ? castArray(collections) : [],
          })
        );
      }

      return json({});
    })
    .build();
};
