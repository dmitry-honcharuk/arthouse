import type { User } from '@prisma/client';
import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { prisma } from '~/db.server';

export default function Index() {
  const { user } = useLoaderData<LoaderData>();

  console.log('USER', user);

  return (
    <div>
      <h1 className="text-3xl pt-36 font-bold text-center">
        Welcome to Arthouse
      </h1>
      <div className="text-center">
        <Link to="about-us" className="underline">
          about us
        </Link>
      </div>
    </div>
  );
}

type LoaderData = { user: User };
export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await prisma.user.create({
    data: { id: '7bbaae0e-482c-4bb8-8da2-eb17cd50bbfb' },
  });

  return json<LoaderData>({ user });
};
