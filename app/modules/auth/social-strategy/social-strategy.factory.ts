import { FacebookSocialStrategy } from '~/modules/auth/social-strategy/facebook.social-strategy';
import { GoogleSocialStrategy } from '~/modules/auth/social-strategy/google.social-strategy';
import type { SocialStrategy } from '~/modules/auth/social-strategy/social-strategy';
import { SocialProvider } from '~/modules/auth/types/social-provider';

export class SocialStrategyFactory {
  constructor(private token: string) {}

  getSocialStrategy(provider: SocialProvider): SocialStrategy {
    switch (provider) {
      case SocialProvider.Facebook:
        return new FacebookSocialStrategy(this.token);

      case SocialProvider.Google:
        return new GoogleSocialStrategy(this.token);

      default:
        throw new Error(`No Social strategy for provider ${provider}`);
    }
  }
}
