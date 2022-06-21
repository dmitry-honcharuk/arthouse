import {
  AccountCircleOutlined,
  GridViewOutlined,
  PersonPin,
} from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import type { User } from '@prisma/client';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { castArray } from 'lodash';
import { z } from 'zod';
import { Breadcrumbs } from '~/modules/common/breadcrumbs';
import { UserLayout } from '~/modules/users/components/user-layout';
import { getUserPath } from '~/modules/users/get-user-path';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import { useUserOutletContext } from '~/modules/users/hooks/use-user-outlet-context';
import { updateUser } from '~/modules/users/update-user';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';
import { requireSessionUser } from '~/server/require-session-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  const { user } = z
    .object({
      user: z.string(),
    })
    .parse(params);

  const [currentUser, requestedUser] = await Promise.all([
    getLoggedInUser(request),
    getUserByIdentifier(user),
  ]);

  if (!currentUser || currentUser.id !== requestedUser?.id) {
    throw new Response(null, { status: 404 });
  }

  return null;
};

export const action: ActionFunction = async (actionDetails) => {
  return new ActionBuilder(actionDetails)
    .use('PUT', async ({ request }) => {
      const accountFields: Partial<Pick<User, 'showExplicit'>> = {};

      const user = await requireSessionUser(request);
      const formDataHandler = new FormDataHandler(request);

      const { fields: field } = await formDataHandler.validate(
        z.object({
          fields: z.union([z.string(), z.array(z.string())]),
        })
      );

      const fields = castArray(field);

      if (fields.includes('explicit')) {
        const { showExplicit } = await formDataHandler.validate(
          z.object({
            showExplicit: z.union([z.literal('true'), z.literal('false')]),
          })
        );

        accountFields.showExplicit = showExplicit === 'true';
      }

      return json(await updateUser(user.id, accountFields));
    })
    .build();
};

export default function UserAccount() {
  const fetcher = useFetcher();
  const { user, currentUser } = useUserOutletContext();

  return (
    <UserLayout
      breadcrumbs={
        <Breadcrumbs
          items={[
            {
              icon: <GridViewOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Browse',
              link: '/',
            },
            {
              icon: <PersonPin sx={{ mr: 0.5 }} fontSize="small" />,
              label: user.profile?.nickname ?? null,
              link: `/${getUserPath(user)}`,
            },
            {
              icon: <AccountCircleOutlined sx={{ mr: 0.5 }} fontSize="small" />,
              label: 'Account',
            },
          ]}
        />
      }
    >
      <main className="flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <Typography variant="h5">Explicit content</Typography>

          <Card variant="outlined">
            <CardContent>
              <fetcher.Form method="put">
                <Box display="grid" gridTemplateColumns="auto 1fr" gap={2}>
                  <div className="text-xs font-bold pt-1">18+</div>
                  <Stack>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={currentUser?.showExplicit ?? false}
                          size="small"
                          onChange={(_, enabled) => {
                            fetcher.submit(
                              {
                                fields: 'explicit',
                                showExplicit: `${enabled}`,
                              },
                              { method: 'put' }
                            );
                          }}
                        />
                      }
                      label="Display explicit content"
                    />
                    <Typography variant="caption">
                      {currentUser?.showExplicit
                        ? 'Disabling this setting will result in projects marked as explicit to be removed from across the site.'
                        : 'Enabling this setting will result in projects marked as explicit to be listed across the site.'}
                    </Typography>
                  </Stack>
                </Box>
              </fetcher.Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </UserLayout>
  );
}
