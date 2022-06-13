import type { SocialStrategy } from '~/modules/auth/social-strategy/social-strategy';
import { SocialProvider } from '~/modules/auth/types/social-provider';
import type { SocialUser } from '~/modules/auth/types/social-user';

export class GoogleSocialStrategy implements SocialStrategy {
  constructor(private token: string) {}

  async authorize(): Promise<SocialUser> {
    const { OAuth2Client } = await import('google-auth-library');
    const clientId = process.env.GOOGLE_CLIENT_ID;

    const client = new OAuth2Client({ clientId });

    const ticket = await client.verifyIdToken({
      idToken: this.token,
      audience: `${clientId}.apps.googleusercontent.com`,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Failed to get google auth payload.');
    }

    const { sub: id, email, given_name, family_name } = payload;

    if (!email) {
      throw new Error(
        `No email retrieved from provider ${SocialProvider.Google}`
      );
    }

    return { id, email, firstName: given_name, lastName: family_name };
  }
}
