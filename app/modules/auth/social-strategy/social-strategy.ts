import type { SocialUser } from '~/modules/auth/types/social-user';

export interface SocialStrategy {
  authorize(): Promise<SocialUser>;
}
