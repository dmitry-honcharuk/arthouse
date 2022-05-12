import { ProjectItemType } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { json, Response } from '@remix-run/node';
import { z } from 'zod';
import { deleteProjectItem } from '~/modules/projects/delete-project-item';
import { getUserProject } from '~/modules/projects/get-user-project';
import { updateProjectItem } from '~/modules/projects/update-project-item';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { requireSessionUser } from '~/server/require-session-user.server';

export const action: ActionFunction = async (actionDetails) => {
  const { request, params } = actionDetails;

  const {
    user: userID,
    project: projectID,
    item: itemID,
  } = z
    .object({
      user: z.string(),
      project: z.string(),
      item: z.string(),
    })
    .parse(params);

  const [{ id: currentUserId }, project] = await Promise.all([
    requireSessionUser(request),
    getUserProject(userID, projectID),
  ]);

  if (!project) {
    throw new Response('Not Found', { status: 404 });
  }

  if (currentUserId !== project.userId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const item = project.items.find(({ id }) => id === itemID);

  if (!item) {
    throw new Response('Invalid item id', { status: 422 });
  }

  return new ActionBuilder(actionDetails)
    .use('DELETE', async () => {
      await deleteProjectItem(item.id);

      return json({});
    })
    .use('PUT', async () => {
      const formDataHandler = new FormDataHandler(request);

      const commonFields = {
        title: z.ostring(),
        caption: z.ostring(),
      };

      const data = await formDataHandler.validate(
        z.union([
          z.object({
            ...commonFields,
            type: z.literal(ProjectItemType.IMAGE),
            image: z.string().optional(),
          }),
          z.object({
            ...commonFields,
            type: z.literal(ProjectItemType.YOUTUBE),
            url: z.string().optional(),
          }),
        ])
      );

      await updateProjectItem(item.id, {
        value: data.type === ProjectItemType.IMAGE ? data.image : data.url,
        title: data.title ?? null,
        caption: data.caption ?? null,
      });

      return json({});
    })
    .build();
};
