import { ProjectItemType } from '@prisma/client';
import type { ActionFunction } from '@remix-run/node';
import { json, Response } from '@remix-run/node';
import { z } from 'zod';
import { deleteProjectItem } from '~/modules/projects/delete-project-item';
import { getUserProject } from '~/modules/projects/get-user-project';
import { updateProjectItem } from '~/modules/projects/update-project-item';
import { validateUpdateItemFormData } from '~/modules/projects/utils/validate-update-item-form-data';
import { getRequestFormData } from '~/server/get-form-data.server';
import { requireUser } from '~/server/require-user.server';

export const action: ActionFunction = async ({ request, params }) => {
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
    requireUser(request),
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

  if (request.method === 'DELETE') {
    await deleteProjectItem(item.id);
  } else if (request.method === 'PUT') {
    const formData = await getRequestFormData(request);

    const data = validateUpdateItemFormData(formData);

    await updateProjectItem(item.id, {
      value: data.type === ProjectItemType.IMAGE ? data.image : data.url,
      title: data.title ?? null,
      caption: data.caption ?? null,
    });
  }

  return json({});
};
