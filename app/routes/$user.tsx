import { ArrowBackIosNew, PersonPin, Shop2Outlined } from '@mui/icons-material';
import { Button, Tab, Tabs } from '@mui/material';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, Outlet, useLoaderData, useMatches } from '@remix-run/react';
import * as React from 'react';
import Layout from '~/modules/common/layout';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { requireLoggedInUser } from '~/server/require-logged-in-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const { user: userId } = params;

    const [user, currentUser] = await Promise.all([
      getUserByIdentifier(userId!),
      requireLoggedInUser(request),
    ]);

    if (!user) {
      throw new Response('Not Found', { status: 404 });
    }

    return json({
      user,
      currentUser: currentUser as UserWithProfile,
    });
  } catch (error) {
    throw new Response('Not Found', { status: 404 });
  }
};

export default function UserProfile() {
  const { user, currentUser } = useLoaderData<{
    user: UserWithProfile;
    currentUser: UserWithProfile;
  }>();
  const matches = useMatches();
  const previous = matches[matches.length - 2];
  const current = matches[matches.length - 1];
  const isProjectPage = current.id !== 'routes/$user/$project/index';

  const [value, setValue] = React.useState(
    current.pathname.includes('profile') ? 1 : 0
  );

  return (
    <Layout currentUser={currentUser} className="flex flex-col gap-8">
      {isProjectPage ? (
        <Tabs
          value={value}
          onChange={(_, newValue) => setValue(newValue)}
          aria-label="icon position tabs example"
        >
          <Tab
            icon={<Shop2Outlined />}
            to="."
            component={Link}
            iconPosition="end"
            label="projects"
          />
          <Tab
            icon={<PersonPin />}
            to="profile"
            component={Link}
            iconPosition="end"
            label="profile"
          />
        </Tabs>
      ) : (
        <div className="pt-4">
          <Link to={previous.pathname}>
            <Button startIcon={<ArrowBackIosNew />} color="inherit">
              Back
            </Button>
          </Link>
        </div>
      )}

      <Outlet context={{ user, isCurrentUser: user.id === currentUser.id }} />
    </Layout>
  );
}
