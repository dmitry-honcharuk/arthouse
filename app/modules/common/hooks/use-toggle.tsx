import { useCallback, useState } from 'react';

export function useToggle(defaultValue = false) {
  const [value, setValue] = useState(defaultValue);

  return [value, useCallback(() => setValue((v) => !v), [])] as const;
}
