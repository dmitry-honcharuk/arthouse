import { LoadingButton } from '@mui/lab';
import {
  Divider,
  Link as MaterialLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import {
  Form,
  useActionData,
  useLoaderData,
  useOutletContext,
  useSubmit,
  useTransition,
} from '@remix-run/react';
import * as React from 'react';
import { useCallback } from 'react';
import { GoogleLogin } from 'react-google-login';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { FacebookLoginButton } from '~/modules/auth/components/facebook-login-button';
import { getUserToken, isTokenExpiredError } from '~/modules/auth/jwt';
import {
  generateMagicLink,
  resolveMagicLink,
} from '~/modules/auth/magic-link/magic-link.server';
import { SocialStrategyFactory } from '~/modules/auth/social-strategy/social-strategy.factory';
import { SocialProvider } from '~/modules/auth/types/social-provider';
import { emailService } from '~/modules/email';
import {
  createUser,
  getUserByEmail,
  getUserBySocial,
} from '~/modules/users/get-user-by-social';
import { getUserPath } from '~/modules/users/get-user-path';
import { ActionBuilder } from '~/server/action-builder.server';
import { FormDataHandler } from '~/server/form-data-handler.server';
import { commitSession, getSession } from '~/server/sessions.server';
import type { InitialData } from '~/types/initial-data';

interface LoaderData {
  magicLinkError?: string;
}

interface ActionData {
  magicSent: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get('Cookie'));

    const resolved = await resolveMagicLink(request.url);

    if (!resolved) {
      return json<LoaderData>({});
    }

    const user =
      (await getUserByEmail(resolved.email)) ??
      (await createUser(resolved.email));

    session.set('user-token', getUserToken(user));

    return redirect(`/${getUserPath(user)}`, {
      headers: {
        'Set-Cookie': await commitSession(session),
      },
    });
  } catch (error) {
    return json<LoaderData>({
      magicLinkError: isTokenExpiredError(error)
        ? 'Your link expired, please please try again'
        : 'Authentication by magic link has failed, please try again',
    });
  }
};

export const action: ActionFunction = async (actionDetails) => {
  return new ActionBuilder(actionDetails)
    .use('POST', async ({ request }) => {
      const formDataHandler = new FormDataHandler(request);

      const { magic_email: email } = await formDataHandler.validate(
        z.object({
          magic_email: z.string().email().optional(),
        })
      );

      if (email) {
        const { origin } = new URL(request.url);

        await emailService.sendMagicLink(
          await generateMagicLink({
            email,
            linkDomain: origin,
          }),
          { to: email }
        );

        return json<ActionData>({
          magicSent: email,
        });
      }

      const session = await getSession(request.headers.get('Cookie'));

      const { provider, token } = await formDataHandler.validate(
        z.object({
          token: z.string(),
          provider: z.nativeEnum(SocialProvider),
        })
      );

      const strategy = new SocialStrategyFactory(token).getSocialStrategy(
        provider as SocialProvider
      );

      const socialUser = await strategy.authorize();

      const user = await getUserBySocial({
        email: socialUser.email,
        firstName: socialUser.firstName,
        lastName: socialUser.lastName,
        social: { id: socialUser.id, provider: provider as SocialProvider },
      });

      session.set('user-token', getUserToken(user));

      return redirect(`/${getUserPath(user)}`, {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      });
    })
    .build();
};

export default function Authenticate() {
  const { magicLinkError } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const submit = useSubmit();
  const context = useOutletContext<InitialData>();
  const { state } = useTransition();

  const onFacebookSuccess = useCallback(
    ({ token }) => {
      submit(
        { token, provider: SocialProvider.Facebook },
        { replace: true, method: 'post' }
      );
    },
    [submit]
  );

  if (actionData?.magicSent) {
    return (
      <div className="pt-36 px-10 flex justify-center">
        <Stack gap={2}>
          <div>
            <Divider>MAGIC LINK</Divider>
          </div>

          <Stack gap={1} alignItems="center">
            <Typography variant="overline">Sent to</Typography>
            <Typography variant="h6">
              <Stack direction="row" gap={1}>
                <span className="scale-x-[-1] text-2xl">✨</span>
                {actionData.magicSent}
                <span className="text-2xl">✨</span>
              </Stack>
            </Typography>
            <Typography variant="subtitle1" textAlign="center">
              Please check your email and follow a link that you'll find in
              there.
              <br />
              The link would be valid for 10 minutes.
            </Typography>
            <MaterialLink component={Link} to="/authenticate">
              Back to options
            </MaterialLink>
          </Stack>
        </Stack>
      </div>
    );
  }

  return (
    <div className="pt-36 flex justify-center">
      <Stack sx={{ width: 256 }} gap={2}>
        <div>
          <Divider>MAGIC LINK</Divider>
        </div>

        <Form method="post">
          <Stack gap={1}>
            <TextField
              label="Email"
              name="magic_email"
              type="email"
              size="small"
              error={!!magicLinkError}
              helperText={
                magicLinkError ??
                'We will send you a letter with a link to your account.'
              }
              disabled={state !== 'idle'}
              required
            />
            <LoadingButton
              loading={state !== 'idle'}
              type="submit"
              variant="contained"
            >
              Send
            </LoadingButton>
          </Stack>
        </Form>

        <div>
          <Divider>OR</Divider>
        </div>

        <Form method="post" replace className="flex flex-col gap-2">
          <Stack gap={2}>
            <FacebookLoginButton onSuccess={onFacebookSuccess} />

            <div>
              <Divider>OR</Divider>
            </div>

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
          </Stack>
        </Form>
      </Stack>
    </div>
  );
}
