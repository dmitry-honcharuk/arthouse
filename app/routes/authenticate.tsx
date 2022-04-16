import type { ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useOutletContext, useSubmit } from '@remix-run/react';
import * as React from 'react';
import { useCallback } from 'react';
import { GoogleLogin } from 'react-google-login';
import { FacebookLoginButton } from '~/modules/auth/components/facebook-login-button';
import { getUserToken } from '~/modules/auth/jwt';
import { SocialStrategyFactory } from '~/modules/auth/social-strategy/social-strategy.factory';
import { SocialProvider } from '~/modules/auth/types/social-provider';
import { getUserBySocial } from '~/modules/users/get-user-by-social';
import { getUserPath } from '~/modules/users/get-user-path';
import { commitSession, getSession } from '~/sessions.server';
import type { InitialData } from '~/types/initial-data';

export const action: ActionFunction = async ({ request }) => {
  const data = await request.formData();

  const token = data.get('token');
  const provider = data.get('provider');

  const session = await getSession(request.headers.get('Cookie'));

  if (
    typeof provider !== 'string' ||
    !Object.values(SocialProvider).includes(provider as SocialProvider)
  ) {
    throw new Error(`Invalid Provider ${provider}`);
  }

  if (typeof token !== 'string') {
    throw new Error(`Form not submitted correctly.`);
  }

  const strategy = new SocialStrategyFactory(token).getSocialStrategy(
    provider as SocialProvider
  );

  const socialUser = await strategy.authorize();

  const user = await getUserBySocial({
    email: socialUser.email,
    social: { id: socialUser.id, provider: provider as SocialProvider },
  });

  session.set('user-token', getUserToken(user));

  return redirect(`/${getUserPath(user)}`, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
};

export default function Authenticate() {
  const submit = useSubmit();
  const context = useOutletContext<InitialData>();

  return (
    <div className="pt-36 flex justify-center">
      <Form method="post" replace className="flex flex-col gap-2">
        <FacebookLoginButton
          onSuccess={useCallback(
            ({ token }) => {
              submit(
                { token, provider: SocialProvider.Facebook },
                { replace: true, method: 'post' }
              );
            },
            [submit]
          )}
        />
        <GoogleLogin
          theme="dark"
          clientId={context.ENV.GOOGLE_CLIENT_ID}
          onSuccess={(googleUser) => {
            if (!('getBasicProfile' in googleUser)) {
              return;
            }

            const token = googleUser.getAuthResponse().id_token;

            submit(
              { token, provider: SocialProvider.Google },
              { replace: true, method: 'post' }
            );
          }}
        />
      </Form>
    </div>
  );
}
