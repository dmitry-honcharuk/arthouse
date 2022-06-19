import { Button, Typography } from '@mui/material';
import { useFetcher, useNavigate } from '@remix-run/react';
import type { FC } from 'react';

export const ExplicitProjectSplashScreen: FC<{}> = () => {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  return (
    <fetcher.Form method="put" action="/confirm-age">
      <main className="pt-10">
        <div className="flex flex-col justify-center items-center">
          <div>
            <Typography variant="h4" gutterBottom>
              Explicit
            </Typography>
            <Typography gutterBottom>
              This project contains explicit content.
            </Typography>
            <Typography>
              Users under 18 years are not allowed to proceed.
            </Typography>
            <div className="flex gap-2 mt-5 justify-end">
              <Button onClick={() => navigate(-1)}>Go Back</Button>
              <Button type="submit" variant="contained">
                I am 18+ years old
              </Button>
            </div>
          </div>
        </div>
      </main>
    </fetcher.Form>
  );
};
