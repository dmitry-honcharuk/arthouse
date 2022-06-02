import type { ActionFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { z } from 'zod';
import { addFollower } from '~/modules/users/add-follower';
import { removeFollower } from '~/modules/users/remove-follower';
import { ActionBuilder } from '~/server/action-builder.server';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

export const action: ActionFunction = async (actionDetails) => {
  const currentUser = await requireLoggedInUser(actionDetails.request);

  const { userId } = z
    .object({
      userId: z.string(),
    })
    .parse(actionDetails.params);

  return new ActionBuilder(actionDetails)
    .use('POST', async () => {
      return json(
        await addFollower({
          userId,
          followerId: currentUser.id,
        })
      );
    })
    .use('DELETE', async () => {
      return json(
        await removeFollower({
          userId,
          followerId: currentUser.id,
        })
      );
    })
    .build();
};
