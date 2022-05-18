import { useFetcher } from '@remix-run/react';
import type { FC, ReactNode } from 'react';
import * as React from 'react';
import { useRef } from 'react';
import { SecuritySwitch } from '~/modules/common/security-switch';
import type { WithDecryptedSecurity } from '~/modules/crypto/types/with-decrypted-security';

interface Props {
  item: WithDecryptedSecurity;
  onSuccess: () => void;
  tooltip: ReactNode;
}

export const SecuritySwitchSetting: FC<Props> = ({
  item,
  onSuccess,
  tooltip,
}) => {
  const fetcher = useFetcher();

  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <fetcher.Form method="put" ref={formRef}>
      <input type="hidden" name="fields" value="secure" />
      <SecuritySwitch
        tooltip={tooltip}
        isSecure={item.isSecure}
        disabled={!item.security}
        onChange={(secure) => {
          const formData = new FormData(formRef.current!);

          formData.set('secure', secure ? 'true' : 'false');

          fetcher.submit(formData, { method: 'put' });

          onSuccess();
        }}
      />
    </fetcher.Form>
  );
};
