import { Link } from '@remix-run/react';
import cn from 'classnames';
import type { FC } from 'react';

export const NicknameTag: FC<{
  nickname: string;
  className?: string;
  isLink?: boolean;
}> = ({ nickname, isLink = false, className }) => {
  return (
    <span
      className={cn('py-0.5 px-2 border border-gray-700 rounded', className)}
    >
      {isLink ? (
        <Link to={`/${nickname}`} className="underline underline-offset-2">
          {nickname}
        </Link>
      ) : (
        nickname
      )}
    </span>
  );
};
