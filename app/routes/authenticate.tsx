import type { ActionFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { Form, useOutletContext, useSubmit } from '@remix-run/react';
import * as React from 'react';
import { GoogleLogin } from 'react-google-login';
import { getUserToken } from '~/modules/auth/jwt';
import { getUserBySocial } from '~/modules/users/get-user-by-social';
import { commitSession, getSession } from '~/sessions';
import type { InitialData } from '~/types/initial-data';

export const action: ActionFunction = async ({ request }) => {
  const idToken = (await request.formData()).get('idToken');
  const session = await getSession(request.headers.get('Cookie'));

  if (typeof idToken !== 'string') {
    throw new Error(`Form not submitted correctly.`);
  }

  const { OAuth2Client } = await import('google-auth-library');
  const client = new OAuth2Client({
    clientId: '968212429669-u2971f8fp53vpkup93hqrvn12hc17s8s',
  });

  const ticket = await client.verifyIdToken({
    idToken,
    audience: `${process.env.GOOGLE_CLIENT_ID}.apps.googleusercontent.com`,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error('Failed to get google auth payload.');
  }

  const { sub: googleId, email } = payload;

  if (!email) {
    throw new Error('No email provided');
  }

  const user = await getUserBySocial({ email, googleId });

  session.set('user-token', getUserToken(user));

  return redirect(`/${user.id}`, {
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
      <Form method="post" replace>
        <input type="hidden" name="idToken" />

        <GoogleLogin
          theme="dark"
          clientId={context.ENV.GOOGLE_CLIENT_ID}
          onSuccess={(googleUser) => {
            if (!('getBasicProfile' in googleUser)) {
              return;
            }

            const idToken = googleUser.getAuthResponse().id_token;

            submit({ idToken }, { replace: true, method: 'post' });
          }}
        />
      </Form>
    </div>
  );
}
