import type { FC, ReactNode } from 'react';
import { useState } from 'react';

type Props = {
  defaultValue?: boolean;
  children: (options: {
    isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    toggle: () => void;
  }) => ReactNode;
};

export const TogglableContent: FC<Props> = ({
  children,
  defaultValue = false,
}) => {
  const [isEnabled, setIsEnabled] = useState(defaultValue);

  return (
    <>
      {children({
        isEnabled: isEnabled,
        enable: () => setIsEnabled(true),
        disable: () => setIsEnabled(false),
        toggle: () => setIsEnabled((state) => !state),
      })}
    </>
  );
};
