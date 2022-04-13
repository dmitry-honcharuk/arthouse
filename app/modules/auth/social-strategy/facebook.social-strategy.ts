import type { SocialStrategy } from '~/modules/auth/social-strategy/social-strategy';
import type { SocialUser } from '~/modules/auth/types/social-user';

export class FacebookSocialStrategy implements SocialStrategy {
  constructor(private token: string) {}

  async authorize(): Promise<SocialUser> {
    const params = new URLSearchParams([
      ['fields', 'email'],
      ['access_token', this.token],
    ]);

    return fetch(`https://graph.facebook.com/me?${params.toString()}`).then(
      (r) => r.json()
    );
  }
}
