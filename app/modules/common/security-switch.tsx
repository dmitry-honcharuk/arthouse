import { Stack, Switch, Tooltip, Typography } from '@mui/material';
import type { FC, ReactNode } from 'react';

export const SecuritySwitch: FC<{
  isSecure: boolean;
  disabled: boolean;
  onChange: (secure: boolean) => void;
  tooltip?: ReactNode;
}> = ({ isSecure, disabled, onChange, tooltip }) => {
  const securitySwitch = (
    <Stack direction="row" alignItems="center">
      <Typography>Public</Typography>
      <Switch
        checked={isSecure}
        disabled={disabled}
        size={'small'}
        onChange={(_, secure) => {
          onChange(secure);
        }}
      />
      <Typography>Secure</Typography>
    </Stack>
  );

  if (!disabled || !tooltip) {
    return securitySwitch;
  }

  return (
    <Tooltip placement="top-start" title={tooltip}>
      {securitySwitch}
    </Tooltip>
  );
};
