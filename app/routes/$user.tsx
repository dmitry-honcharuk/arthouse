import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import Layout from '~/modules/common/layout';
import { getUserByIdentifier } from '~/modules/users/getUserById';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';
import { getLoggedInUser } from '~/server/get-logged-in-user.server';

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const { user: userId } = params;

    const [user, currentUser] = await Promise.all([
      getUserByIdentifier(userId!),
      getLoggedInUser(request),
    ]);

    if (!user) {
      throw new Response('Not Found', { status: 404 });
    }

    return json({
      user,
      currentUser: currentUser,
    });
  } catch (error) {
    throw new Response('Not Found', { status: 404 });
  }
};

export default function UserProfile() {
  const { user, currentUser } = useLoaderData<{
    user: UserWithProfile;
    currentUser: UserWithProfile | null;
  }>();

  return (
    <Layout currentUser={currentUser} className="flex flex-col gap-8">
      <Outlet
        context={{
          user,
          isCurrentUser: user.id === currentUser?.id,
          currentUser,
        }}
      />
    </Layout>
  );
}
