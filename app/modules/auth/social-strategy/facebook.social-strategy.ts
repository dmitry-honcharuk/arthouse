import type { SocialStrategy } from '~/modules/auth/social-strategy/social-strategy';
import type { SocialUser } from '~/modules/auth/types/social-user';

export class FacebookSocialStrategy implements SocialStrategy {
  constructor(private token: string) {}

  async authorize(): Promise<SocialUser> {
    const params = new URLSearchParams([
      ['fields', ['email', 'first_name', 'last_name'].join(',')],
      ['access_token', this.token],
    ]);

    const {
      id,
      email,
      first_name: firstName,
      last_name: lastName,
    } = await fetch(`https://graph.facebook.com/me?${params.toString()}`).then(
      (r) => r.json()
    );

    return {
      id,
      email,
      firstName,
      lastName,
    };
  }
}
