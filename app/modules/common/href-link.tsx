import { Link } from '@remix-run/react';
import { forwardRef } from 'react';

export const HrefLink = forwardRef<HTMLAnchorElement, { href: string }>(
  function HrefLink({ href, children }, ref) {
    return (
      <Link to={href} ref={ref}>
        {children}
      </Link>
    );
  }
);
