import { ConnectWithoutContact } from '@mui/icons-material';
import type { FC, ReactNode } from 'react';
import { getSocialIcon } from '~/modules/users/components/profile/get-social-icon';
import { isEmail } from '~/modules/users/components/profile/is-email';

function getHost(link: string) {
  try {
    return new URL(link).host;
  } catch (e) {
    return link;
  }
}

export const SocialLink: FC<{
  link: string;
  children: (options: {
    label: string;
    icon: ReactNode;
    href: string;
  }) => ReactNode;
}> = ({ link, children }) => {
  const Icon = getSocialIcon(link);

  return (
    <>
      {children({
        icon: Icon ? <Icon /> : <ConnectWithoutContact />,
        label: getHost(link),
        href: isEmail(link) ? `mailto:${link}` : link,
      })}
    </>
  );
};
