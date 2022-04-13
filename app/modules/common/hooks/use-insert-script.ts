import { useEffect } from 'react';

interface InsertScriptOptions {
  id: string;
  src?: string;
  content?: () => void;
  async?: boolean;
  defer?: boolean;
  extraAttributes?: Record<string, string>;
}

export function useInsertScript({
  id,
  src,
  content,
  async = false,
  defer = false,
  extraAttributes,
}: InsertScriptOptions) {
  useEffect(() => {
    if (!src && !content) {
      return;
    }

    const existingTag = document.getElementById(id);

    if (!existingTag) {
      const script = document.createElement('script');

      if (src) script.src = src;
      if (content) script.innerHTML = `(${content.toString()})()`;

      if (extraAttributes) {
        Object.entries(extraAttributes).forEach(([key, value]) => {
          // @ts-ignore
          script[key] = value;
        });
      }

      script.id = id;

      script.async = async;
      script.defer = defer;

      script.type = 'text/javascript';

      document.body.appendChild(script);
    }

    // eslint-disable-next-line consistent-return
    return () => {
      if (!src) {
        return;
      }

      const existingTag = document.getElementById(id);

      if (existingTag) {
        existingTag.remove();
      }
    };
  }, [async, defer, src, id, content, extraAttributes]);
}
