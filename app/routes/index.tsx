import { Link } from '@remix-run/react';

export default function Index() {
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
