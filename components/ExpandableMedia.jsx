'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { isVideoMediaSrc } from '@/lib/media';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export default function ExpandableMedia({ src, alt, imageLoading = 'lazy' }) {
  const mediaSrc = getText(src);
  const mediaLabel = getText(alt) || 'Медиа RUNA';
  const isVideo = isVideoMediaSrc(mediaSrc);
  const [mounted, setMounted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox();
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeLightbox, isLightboxOpen]);

  if (!mediaSrc) return null;

  if (isVideo) {
    return <video src={mediaSrc} aria-label={mediaLabel} controls preload="metadata" playsInline />;
  }

  return (
    <>
      <button
        className="expandable-media-trigger"
        type="button"
        onClick={() => setIsLightboxOpen(true)}
        aria-label="Открыть изображение во весь экран"
      >
        <img src={mediaSrc} alt={mediaLabel} loading={imageLoading} />
        <span className="expandable-media-hint">Во весь экран</span>
      </button>

      {mounted &&
        isLightboxOpen &&
        createPortal(
          <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр изображения">
            <button className="photo-lightbox-backdrop" type="button" onClick={closeLightbox} aria-label="Закрыть просмотр" />

            <div className="photo-lightbox-shell">
              <button className="photo-lightbox-close" type="button" onClick={closeLightbox} aria-label="Закрыть">
                ×
              </button>

              <figure className="photo-lightbox-figure">
                <img src={mediaSrc} alt={mediaLabel} draggable={false} />
                <figcaption className="photo-lightbox-caption">
                  <span>{mediaLabel}</span>
                </figcaption>
              </figure>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
