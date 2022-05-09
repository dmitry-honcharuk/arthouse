import { LoadingButton } from '@mui/lab';
import { Stack } from '@mui/material';
import { ProjectStatus } from '@prisma/client';
import { Link, useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { SecuritySwitch } from '~/modules/common/security-switch';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import type { WithProjectSecurity } from '~/modules/projects/types/with-project-security';
import type { WithUser } from '~/modules/users/types/with-user';

type props = {
  project: ProjectWithItems & WithUser & WithProjectSecurity;
  action: string;
  settingsPath: string;
};

export const ProjectPublicityForm: FC<props> = ({
  project,
  action,
  settingsPath,
}) => {
  const fetcher = useFetcher();

  const [pending, setPending] = useState(fetcher.state !== 'idle');

  useEffect(() => {
    const currentlyPending = fetcher.state !== 'idle';

    if (currentlyPending && pending !== currentlyPending) {
      setPending(currentlyPending);

      setTimeout(() => setPending(false), 1000);
    }
  }, [fetcher.state, pending]);

  const isPublished = project.status === ProjectStatus.PUBLISHED;

  return (
    <fetcher.Form method="put" action={action}>
      <input type="hidden" name="fields" value="status" />
      <input
        type="hidden"
        name="status"
        value={isPublished ? ProjectStatus.DRAFT : ProjectStatus.PUBLISHED}
      />

      <Stack spacing={2}>
        <SecuritySwitch
          tooltip={
            <div>
              <div>
                You need to setup a password in order to secure this project.
              </div>
              <div>
                This could be done{' '}
                <Link to={settingsPath} className="underline">
                  in settings
                </Link>
              </div>
            </div>
          }
          isSecure={project.isSecure}
          disabled={!project.projectSecurity}
          onChange={(secure) => {
            fetcher.submit(
              { fields: 'secure', secure: String(secure) },
              { method: 'put', action }
            );
          }}
        />
        <LoadingButton
          type="submit"
          variant="contained"
          color={isPublished ? 'inherit' : 'secondary'}
          loading={pending}
        >
          {isPublished ? 'Move to drafts' : 'Release'}
        </LoadingButton>
      </Stack>
    </fetcher.Form>
  );
};
