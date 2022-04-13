import { useEffect } from 'react';

export function useWindowField(fieldName: string, value: any) {
  useEffect(() => {
    if (!window) {
      return;
    }

    // @ts-ignore
    if (!window[fieldName]) {
      // @ts-ignore
      window[fieldName] = value;
    }

    return () => {
      // @ts-ignore
      if (window[fieldName]) {
        // @ts-ignore
        delete window[fieldName];
      }
    };
  }, [fieldName, value]);
}
