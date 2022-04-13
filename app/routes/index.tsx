import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div className="pt-36 text-center">
      <h1 className="text-3xl font-bold ">Welcome to Arthouse</h1>
      <div className="flex gap-2 justify-center">
        <Link to="about-us" className="underline">
          about us
        </Link>
        <Link to="/authenticate" className="underline">
          authenticate
        </Link>
      </div>
    </div>
  );
}
