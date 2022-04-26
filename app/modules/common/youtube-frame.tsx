import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

const RATIO = 0.5625;

export const YoutubeFrame: FC<{ title: string; url: string }> = ({
  title,
  url,
}) => {
  const videoRef = useRef<HTMLIFrameElement | null>(null);

  const [height, setHeight] = useState(0);

  const src = getEmbedLink(url);

  useEffect(() => {
    const handler = () => {
      setHeight((videoRef.current?.offsetWidth ?? 0) * RATIO);
    };

    window.addEventListener('resize', handler);

    if (videoRef.current?.offsetWidth) {
      handler();
    }

    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);

  if (!src) {
    return null;
  }

  return (
    <iframe
      ref={videoRef}
      title={title}
      width="100%"
      height={height}
      src={src}
      allowFullScreen
    />
  );
};

function getEmbedLink(url: string): string | null {
  if (/\/embed\//.test(url)) {
    return url;
  }

  try {
    const id = new URL(url).searchParams.get('v');

    if (!id) {
      return null;
    }

    return `https://www.youtube.com/embed/${id}`;
  } catch (e) {
    return null;
  }
}
