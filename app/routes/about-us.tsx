import { Link } from '@remix-run/react';

export default function Index() {
  return (
    <div>
      <h1 className="text-3xl pt-36 font-bold text-center">About Artwork</h1>
      <div className="text-center">
        <Link to="/" className="underline">
          home
        </Link>
      </div>
    </div>
  );
}
