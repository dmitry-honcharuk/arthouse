import type { SvgIconComponent } from '@mui/icons-material';
import {
  ConnectWithoutContact,
  Facebook,
  GitHub,
  LinkedIn,
  MailOutline,
  Twitter,
  YouTube,
} from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';
import { useOutletContext } from '@remix-run/react';
import type { UserWithProfile } from '~/modules/users/types/social-user';

function getSocialIcon(link: string): SvgIconComponent | null {
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
      return ConnectWithoutContact;
  }
}

export default function UserProfile() {
  const user = useOutletContext<UserWithProfile>();

  return (
    <main className="flex flex-col gap-10 pt-16">
      <section>
        <Typography variant="h3">Profile</Typography>
        <Paper sx={{ p: 2 }} variant="outlined">
          <div className="flex items-center gap-4">
            <MailOutline />
            <a href={`mailto:${user.email}`}>
              <span className="underline">{user.email}</span>
            </a>
          </div>
        </Paper>
      </section>
      <section>
        <Typography variant="h4">Summary</Typography>
        <Paper sx={{ p: 2 }} variant="outlined">
          {user.profile?.summary ?? 'User has no summary yet'}
        </Paper>
      </section>
      <section>
        <Typography variant="h4">Social Links</Typography>
        <Paper sx={{ p: 2 }} variant="outlined" elevation={4}>
          {!user.profile?.socialLinks.length ? (
            'User has no social links yet'
          ) : (
            <div className="flex items-center flex-wrap justify-between">
              {user.profile.socialLinks.map((link) => {
                const Icon = getSocialIcon(link);

                return (
                  <div key={link} className="flex items-center">
                    <div className="p-2">{Icon ? <Icon /> : null}</div>
                    <div className="p-2">
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        <span className="underline">{new URL(link).host}</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Paper>
      </section>
    </main>
  );
}
