import type { SvgIconComponent } from '@mui/icons-material';
import {
  EmailOutlined,
  Facebook,
  GitHub,
  LinkedIn,
  Twitter,
  YouTube,
} from '@mui/icons-material';
import { isEmail } from '~/modules/users/components/profile/is-email';

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
