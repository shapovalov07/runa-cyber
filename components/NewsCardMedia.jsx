'use client';

import { useEffect, useRef } from 'react';
import { isVideoMediaSrc } from '@/lib/media';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export default function NewsCardMedia({ src, alt }) {
  const mediaSrc = getText(src) || '/images/fc26-news.jpg';
  const mediaLabel = getText(alt) || 'Новость RUNA';
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Ignore autoplay blocks; muted autoplay usually succeeds.
        });
      }
    };

    tryPlay();
  }, [mediaSrc]);

  if (isVideoMediaSrc(mediaSrc)) {
    return (
      <video
        ref={videoRef}
        src={mediaSrc}
        aria-label={mediaLabel}
        preload="metadata"
        autoPlay
        muted
        playsInline
        loop
      />
    );
  }

  return <img src={mediaSrc} alt={mediaLabel} loading="lazy" />;
}

