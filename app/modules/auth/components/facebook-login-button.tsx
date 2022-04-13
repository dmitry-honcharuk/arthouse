import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useInsertScript } from '~/modules/common/hooks/use-insert-script';
import { useWindowField } from '~/modules/common/hooks/use-window-field';

interface Props {
  onSuccess(user: { token: string }): void;
}

const APP_ID = '460747149179660';

export const FacebookLoginButton: FC<Props> = ({ onSuccess }) => {
  const statusChangeCallback = useCallback<GetLoginStatusCallback>(
    (response) => {
      if (response.status === 'connected' && response.authResponse) {
        onSuccess({ token: response.authResponse.accessToken });
      } else {
        console.log(
          '// Not logged into your webpage or we are unable to tell.'
        );
      }
    },
    [onSuccess]
  );

  const checkLoginState = useCallback(() => {
    window.FB.getLoginStatus(statusChangeCallback);
  }, [statusChangeCallback]);

  useWindowField('checkLoginState', checkLoginState);

  useWindowField(
    'fbAsyncInit',
    useCallback(() => {
      window.FB.init({
        appId: APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v13.0',
      });

      checkLoginState();
    }, [checkLoginState])
  );

  useInsertScript({
    id: 'facebook-async-init',
    content: useCallback(facebookScriptInit, []),
  });

  useInsertScript({
    id: 'facebook-sdk',
    src: 'https://connect.facebook.net/ru_RU/sdk.js#xfbml=1&version=v13.0',
    defer: true,
    async: true,
    extraAttributes: useMemo(
      () => ({
        crossOrigin: 'anonymous',
        nonce: 'Rs1rJ0qy',
      }),
      []
    ),
  });

  return (
    <div
      className="fb-login-button"
      data-size="large"
      data-button-type="continue_with"
      data-layout="default"
      data-auto-logout-link="false"
      data-use-continue-as="false"
      data-scope="email,public_profile"
      data-on-login="checkLoginState();"
    />
  );
};

declare global {
  interface Window {
    FB: {
      api: (resource: string, callback: ApiRequestCallback) => void;
      getLoginStatus: (callback: GetLoginStatusCallback) => void;
      init: (params: any) => void;
    };
  }
}

type GetLoginStatusCallback = (response: {
  status: string;
  authResponse: null | {
    accessToken: string;
    data_access_expiration_time: number;
    expiresIn: number;
    graphDomain: string;
    signedRequest: string;
    userID: string;
  };
}) => void;

type ApiRequestCallback = (response: {
  email: string;
  first_name: string;
  id: string;
  last_name: string;
}) => void;

const facebookScriptInit = () => {
  (function (d, s, id) {
    var js,
      fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
      return;
    }
    js = d.createElement(s);
    js.id = id;
    // @ts-ignore
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    // @ts-ignore
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
};
