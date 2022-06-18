import { CircularProgress, Stack, Switch, Typography } from '@mui/material';
import { useFetcher } from '@remix-run/react';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import type { ProjectWithItems } from '~/modules/projects/types/project-with-items';
import type { WithProjectSecurity } from '~/modules/projects/types/with-project-security';
import type { WithUser } from '~/modules/users/types/with-user';

type props = {
  project: ProjectWithItems & WithUser & WithProjectSecurity;
  action: string;
};

export const ProjectExplicitlyForm: FC<props> = ({ project, action }) => {
  const fetcher = useFetcher();

  const [pending, setPending] = useState(fetcher.state !== 'idle');

  useEffect(() => {
    const currentlyPending = fetcher.state !== 'idle';

    if (currentlyPending && pending !== currentlyPending) {
      setPending(currentlyPending);

      setTimeout(() => setPending(false), 1000);
    }
  }, [fetcher.state, pending]);

  return (
    <fetcher.Form>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Switch
            checked={project.explicit}
            size={'small'}
            disabled={pending}
            onChange={(_, explicit) => {
              fetcher.submit(
                { fields: 'explicit', explicit: String(explicit) },
                { method: 'put', action }
              );
            }}
          />

          {pending ? (
            <CircularProgress size="1rem" />
          ) : (
            <Typography>Explicit</Typography>
          )}
        </Stack>
      </Stack>
    </fetcher.Form>
  );
};
