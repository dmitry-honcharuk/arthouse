import {
  GppGoodOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { Project } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { getAlbumPath } from '~/modules/albums/get-album-path';
import { getUserAlbum } from '~/modules/albums/get-user-album';
import { TogglableContent } from '~/modules/common/togglable-content';
import { getDecryptedSecurity } from '~/modules/crypto/get-decrypted-security';
import { getProjectPath } from '~/modules/projects/get-project-path';
import { getProjectSecretKey } from '~/modules/projects/get-project-secret-key';
import { getUserProject } from '~/modules/projects/get-user-project';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import {
  commitProjectAuthSession,
  getProjectAuthSession,
} from '~/server/project-auth-session.server';

interface LoaderData {
  project: Project;
  albumIdentifier: string | null;
}

interface ActionData {
  password?: string;
  albumIdentifier?: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const albumIdentifier = new URL(request.url).searchParams.get('album');

  const { user, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(params);

  const [project, album] = await Promise.all([
    getUserProject(user, projectID),
    albumIdentifier ? getUserAlbum(user, albumIdentifier) : null,
  ]);

  if (!project) {
    throw new Response(null, { status: 404 });
  }

  if (
    albumIdentifier &&
    !(album && album.projects.find(({ id }) => project.id === id))
  ) {
    throw new Response(null, { status: 404 });
  }

  const session = await getProjectAuthSession(request.headers.get('Cookie'));

  if (
    !project.isSecure ||
    !project.security ||
    session.get(project.id) === project.security.passwordVersion
  ) {
    return redirect(
      albumIdentifier && album
        ? `/${getAlbumPath(album, album.user)}/${projectID}`
        : `/${getProjectPath(project, project.user)}`
    );
  }

  return json<LoaderData>({ project, albumIdentifier });
};

export const action: ActionFunction = async (actionDetails) => {
  const formDataHandler = new FormDataHandler(actionDetails.request);
  const projectAuthSession = await getProjectAuthSession(
    actionDetails.request.headers.get('Cookie')
  );

  const { user, project: projectID } = z
    .object({
      user: z.string(),
      project: z.string(),
    })
    .parse(actionDetails.params);

  const project = await getUserProject(user, projectID);

  if (!project) {
    throw new Response(null, { status: 404 });
  }

  return new ActionBuilder(actionDetails)
    .use('PUT', async () => {
      const {
        projectId,
        password: passwordAttempt,
        albumIdentifier,
      } = await formDataHandler.validate(
        z.object({
          projectId: z.string(),
          password: z.string(),
          albumIdentifier: z.string().optional(),
        })
      );

      const album = albumIdentifier
        ? await getUserAlbum(user, albumIdentifier)
        : null;

      if (
        albumIdentifier &&
        !(album && album.projects.find(({ id }) => projectId === id))
      ) {
        throw new Response(null, { status: 422 });
      }

      const rediretPath =
        albumIdentifier && album
          ? `/${getAlbumPath(album, album.user)}/${projectID}`
          : `/${getProjectPath(project, project.user)}`;

      if (!project.security) {
        return redirect(rediretPath);
      }

      const { password } = await getDecryptedSecurity(
        project.security,
        getProjectSecretKey()
      );

      const isPasswordValid = passwordAttempt === password;

      if (isPasswordValid) {
        projectAuthSession.set(projectId, project.security.passwordVersion);
      } else {
        projectAuthSession.unset(projectId);
      }

      const headers = {
        'Set-Cookie': await commitProjectAuthSession(projectAuthSession),
      };

      if (isPasswordValid) {
        return redirect(rediretPath, {
          headers,
        });
      }

      return json<ActionData>(
        { password: 'Password is invalid.', albumIdentifier },
        {
          status: 401,
          headers,
        }
      );
    })
    .build();
};

export default function AuthorizeProjectPage() {
  const { project, albumIdentifier } = useLoaderData<LoaderData>();

  const action = useActionData<ActionData>();

  const albumID = action?.albumIdentifier || albumIdentifier;

  return (
    <Stack component="main" alignItems="center" paddingY={8}>
      <Stack
        direction="row"
        alignItems="flex-start"
        gap={1}
        width={500}
        maxWidth="100%"
      >
        <GppGoodOutlined fontSize="large" />

        <Stack gap={4}>
          <div>
            <Typography variant="h4">
              <span>{project.name}</span>
            </Typography>
            <Typography>
              You need to enter a password in order to see this project
            </Typography>
          </div>
          <Stack component={Form} method="put" direction="column" gap={2}>
            <TogglableContent defaultValue={true}>
              {({ isEnabled: isHidden, toggle }) => (
                <TextField
                  name="password"
                  label="Password"
                  type={isHidden ? 'password' : 'text'}
                  error={!!action?.password}
                  helperText={action?.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          size="small"
                          onClick={toggle}
                          edge="end"
                        >
                          {isHidden ? (
                            <VisibilityOutlined />
                          ) : (
                            <VisibilityOffOutlined />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  required
                />
              )}
            </TogglableContent>

            <input type="hidden" name="projectId" value={project.id} />
            {albumID && (
              <input type="hidden" name="albumIdentifier" value={albumID} />
            )}

            <div className="text-right">
              <Button type="submit" variant="outlined">
                Authorize
              </Button>
            </div>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
}
