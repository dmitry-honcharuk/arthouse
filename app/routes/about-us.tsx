import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div>
      <h1 className="text-3xl pt-36 font-bold text-center">About Arthouse</h1>
      <div className="flex gap-2 justify-center">
        <Link to="/" className="underline">
          home
        </Link>
        <Link to="/authenticate" className="underline">
          authenticate
        </Link>
      </div>
    </div>
  );
}
