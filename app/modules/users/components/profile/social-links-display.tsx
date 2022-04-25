import type { SvgIconComponent } from '@mui/icons-material';
import {
  ConnectWithoutContact,
  EmailOutlined,
  Facebook,
  GitHub,
  LinkedIn,
  Twitter,
  YouTube,
} from '@mui/icons-material';
import { Typography } from '@mui/material';
import type { FC } from 'react';
import type { UserWithProfile } from '~/modules/users/types/social-user';

function getHost(link: string) {
  try {
    return new URL(link).host;
  } catch (e) {
    return link;
  }
}

export const SocialLinksDisplay: FC<{ user: UserWithProfile }> = ({ user }) => {
  if (!user.profile?.socialLinks.length) {
    return <Typography>No social links yet</Typography>;
  }

  return (
    <div className="flex items-center flex-wrap gap-6">
      {user.profile.socialLinks.map((link, index) => {
        const Icon = getSocialIcon(link);

        return (
          <div key={`${link}-${index}`} className="flex items-center gap-3">
            <div>{Icon ? <Icon /> : <ConnectWithoutContact />}</div>
            <div>
              <a
                href={isEmail(link) ? `mailto:${link}` : link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="underline">{getHost(link)}</span>
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export function isEmail(link: string): boolean {
  return link.includes('@');
}

export function getSocialIcon(link: string): SvgIconComponent | null {
  if (isEmail(link)) {
    return EmailOutlined;
  }

  try {
    const [, domain] = new URL(link).host.split('.').reverse();

    switch (domain.toLowerCase()) {
      case 'facebook':
        return Facebook;

      case 'twitter':
        return Twitter;

      case 'linkedin':
        return LinkedIn;

      case 'youtube':
        return YouTube;

      case 'github':
        return GitHub;

      default:
        return null;
    }
  } catch (e) {
    return null;
  }
}
