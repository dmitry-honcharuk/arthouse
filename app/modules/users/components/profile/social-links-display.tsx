import { Typography } from '@mui/material';
import type { FC } from 'react';
import { SocialLink } from '~/modules/users/components/profile/social-link';
import type { UserWithProfile } from '~/modules/users/types/user-with-profile';

export const SocialLinksDisplay: FC<{ user: UserWithProfile }> = ({ user }) => {
  if (!user.profile?.socialLinks.length) {
    return <Typography>No social links yet</Typography>;
  }

  return (
    <div className="flex items-center flex-wrap gap-6">
      {user.profile.socialLinks.map((link, index) => {
        return (
          <SocialLink key={`${link}-${index}`} link={link}>
            {({ label, icon, href }) => (
              <div className="flex items-center gap-3">
                <div>{icon}</div>
                <div>
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <span className="underline">{label}</span>
                  </a>
                </div>
              </div>
            )}
          </SocialLink>
        );
      })}
    </div>
  );
};
