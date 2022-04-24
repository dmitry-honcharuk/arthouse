import {
  Add,
  ExpandMore,
  ImageOutlined,
  PhotoCamera,
  VideocamOutlined,
} from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  styled,
  Typography,
} from '@mui/material';
import { ProjectItemType, ProjectStatus } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useState } from 'react';
import type { ImageListType } from 'react-images-uploading';
import ImageUploading from 'react-images-uploading';
import { z } from 'zod';
import { useToggle } from '~/modules/common/hooks/use-toggle';
import { ItemForm } from '~/modules/projects/components/item-form';
import { ProjectItems } from '~/modules/projects/components/project-items';
import { createProjectItem } from '~/modules/projects/create-project-item';
import { getUserProject } from '~/modules/projects/get-user-project';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import { updateProject } from '~/modules/projects/update-project';
import { validateCreateItemFormData } from '~/modules/projects/utils/validate-create-item-form-data';
import { validateFormData } from '~/modules/validation/validate-form-data';
import { getRequestFormData } from '~/server/get-form-data.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(params);

  const [project, currentUser] = await Promise.all([
    getUserProject(user, projectID),
    getLoggedInUser(request),
  ]);

  if (!project) {
    throw new Response('Not Found', { status: 404 });
  }

  const isCurrentUser = currentUser?.id === project.userId;

  if (!isCurrentUser && project.status !== ProjectStatus.PUBLISHED) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({
    project,
    isCurrentUser: isCurrentUser,
  });
};

export const action: ActionFunction = async ({ request, params }) => {
  const { user, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(params);

  const project = await getUserProject(user, projectID);

  if (!project) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const formData = await getRequestFormData(request);

  if (request.method === 'PUT') {
    const { status, preview } = validateFormData(
      formData,
      z.object({
        preview: z.string().optional(),
        status: z.nativeEnum(ProjectStatus).optional(),
      })
    );

    return json(await updateProject(project.id, {
      status,
      ...(typeof preview !== 'undefined' && preview === ''
        ? { preview: null }
        : { preview }),
    }));
  }

  const data = validateCreateItemFormData(formData);

  return json(
    await createProjectItem({
      projectId: project.id,
      type: data.type,
      value: data.type === ProjectItemType.IMAGE ? data.image : data.url,
      title: data.title ?? null,
      caption: data.caption ?? null,
    })
  );
};

export default function ProjectScreen() {
  const { project, isCurrentUser } = useLoaderData<{
    project: ProjectWithItems;
    isCurrentUser: boolean;
  }>();

  const [type, setType] = useState<ProjectItemType>(ProjectItemType.IMAGE);
  const [addItem, toggleAddItem] = useToggle(false);
  const statusFetcher = useFetcher();
  const previewFetcher = useFetcher();

  const isPublished = project.status === ProjectStatus.PUBLISHED;

  const [images, setImages] = useState<ImageListType>([]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-start gap-2">
            <Typography variant="h3">{project.name}</Typography>
            {isCurrentUser && (
              <Status
                className="text-xs capitalize px-2 py-1 rounded border"
                status={project.status}
              >
                {project.status.toLowerCase()}
              </Status>
            )}
          </div>
          {isCurrentUser && (
            <statusFetcher.Form
              method="put"
              className="flex flex-col items-start"
            >
              <input
                type="hidden"
                name="status"
                value={
                  isPublished ? ProjectStatus.DRAFT : ProjectStatus.PUBLISHED
                }
              />
              <Button
                type="submit"
                variant="contained"
                color={isPublished ? 'inherit' : 'secondary'}
              >
                {isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            </statusFetcher.Form>
          )}
        </div>
        {project.caption && (
          <>
            <Typography>{project.caption}</Typography>
          </>
        )}
        {isCurrentUser && (
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Preview Image</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <previewFetcher.Form
                method="put"
                encType="multipart/form-data"
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();

                  const formData = new FormData();

                  if (!images[0]) {
                    alert('Image is required');
                    return;
                  }

                  formData.set('preview', images[0].file!);

                  previewFetcher.submit(formData, {
                    method: 'put',
                    encType: 'multipart/form-data',
                  });
                }}
              >
                <ImageUploading
                  onChange={(imageList) => {
                    setImages(imageList);
                  }}
                  value={images}
                  dataURLKey="data_url"
                  inputProps={{ name: 'preview' }}
                >
                  {({
                    imageList: [uploaded],
                    onImageUpload,
                    isDragging,
                    dragProps,
                  }) => {
                    const image = uploaded
                      ? uploaded
                      : project.preview
                      ? { data_url: project.preview }
                      : null;

                    return (
                      <div className="flex flex-col gap-3">
                        <Box
                          sx={{
                            display: 'grid',
                            gap: 1,
                            gridTemplateAreas: image
                              ? '"upload" "image"'
                              : '"upload"',
                          }}
                        >
                          <Box
                            borderColor={
                              isDragging ? 'primary.light' : undefined
                            }
                            className="border-2 border-dashed border-gray-300 w-full h-full rounded pt-10 pb-8 flex justify-center items-center transition-colors"
                            {...dragProps}
                          >
                            <div className="flex flex-col gap-2">
                              <Button
                                onClick={onImageUpload}
                                startIcon={<PhotoCamera />}
                                variant="outlined"
                              >
                                Upload
                              </Button>
                              <Typography variant="caption">
                                or drug and drop here
                              </Typography>
                            </div>
                          </Box>
                          {image && (
                            <Box
                              key={image['data_url']}
                              component="img"
                              src={image['data_url']}
                              className="rounded"
                              sx={{
                                objectFit: 'cover',
                                height: '100%',
                                width: '100%',
                              }}
                            />
                          )}
                        </Box>
                      </div>
                    );
                  }}
                </ImageUploading>
                <div className="flex gap-2 justify-end">
                  {project.preview && (
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => {
                        statusFetcher.submit(
                          { preview: '' },
                          {
                            method: 'put',
                          }
                        );
                      }}
                    >
                      Remove preview
                    </Button>
                  )}
                  <LoadingButton
                    type="submit"
                    disabled={!images.length}
                    variant="contained"
                    loading={previewFetcher.type === 'actionSubmission'}
                  >
                    Save
                  </LoadingButton>
                </div>
              </previewFetcher.Form>
            </AccordionDetails>
          </Accordion>
        )}
      </div>

      {isCurrentUser ? (
        addItem ? (
          <div className="flex flex-col gap-2">
            <Typography variant="h4">New slide</Typography>

            <div className="flex gap-4 items-start">
              <Paper elevation={3}>
                <MenuList>
                  <MenuItem
                    selected={type === ProjectItemType.IMAGE}
                    onClick={() => setType(ProjectItemType.IMAGE)}
                    sx={{ pr: 3 }}
                  >
                    <ListItemIcon>
                      <ImageOutlined />
                    </ListItemIcon>
                    <ListItemText>Image Upload</ListItemText>
                  </MenuItem>
                  <MenuItem
                    selected={type === ProjectItemType.YOUTUBE}
                    onClick={() => setType(ProjectItemType.YOUTUBE)}
                    sx={{ pr: 3 }}
                  >
                    <ListItemIcon>
                      <VideocamOutlined />
                    </ListItemIcon>
                    <ListItemText>Video Link</ListItemText>
                  </MenuItem>
                </MenuList>
              </Paper>
              <Paper className="flex justify-center grow p-3" elevation={3}>
                <ItemForm type={type} onSuccess={() => toggleAddItem()} />
              </Paper>
            </div>
          </div>
        ) : (
          <div>
            <Button
              onClick={() => toggleAddItem()}
              variant="outlined"
              startIcon={<Add />}
            >
              Add slide
            </Button>
          </div>
        )
      ) : null}

      <ProjectItems items={project.items} isCurrentUser={isCurrentUser} />
    </div>
  );
}

const Status = styled('span')<{ status: ProjectStatus }>(
  ({ theme, status }) => ({
    color:
      status === ProjectStatus.PUBLISHED
        ? theme.palette.secondary.light
        : theme.palette.grey[500],
    borderColor:
      status === ProjectStatus.PUBLISHED
        ? theme.palette.secondary.light
        : theme.palette.grey[500],
  })
);
