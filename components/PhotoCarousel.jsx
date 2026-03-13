'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export default function PhotoCarousel({ items }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const safeItems = useMemo(() => items ?? [], [items]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const getStep = () => {
      const firstItem = track.querySelector('.carousel-item');
      if (!firstItem) return viewport.clientWidth;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0');
      return firstItem.getBoundingClientRect().width + gap;
    };

    const updateButtons = () => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth - 1;
      setCanPrev(viewport.scrollLeft > 1);
      setCanNext(viewport.scrollLeft < maxScroll);
    };

    const onScroll = () => window.requestAnimationFrame(updateButtons);

    viewport.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateButtons);

    updateButtons();

    return () => {
      viewport.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateButtons);
    };
  }, [safeItems.length]);

  const shift = (direction) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const firstItem = track.querySelector('.carousel-item');
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    const base = firstItem ? firstItem.getBoundingClientRect().width + gap : viewport.clientWidth;

    viewport.scrollBy({ left: direction * base, behavior: 'smooth' });
  };

  return (
    <div className="carousel reveal" aria-label="Карусель фото клуба">
      <button
        className="carousel-btn prev"
        type="button"
        aria-label="Предыдущее фото"
        onClick={() => shift(-1)}
        disabled={!canPrev}
      >
        ‹
      </button>

      <div className="carousel-viewport" ref={viewportRef}>
        <div className="carousel-track" ref={trackRef}>
          {safeItems.map((item) => (
            <figure className="media-card carousel-item" key={item.src}>
              <img src={item.src} alt={item.alt} loading="lazy" />
              <figcaption>{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>

      <button
        className="carousel-btn next"
        type="button"
        aria-label="Следующее фото"
        onClick={() => shift(1)}
        disabled={!canNext}
      >
        ›
      </button>
    </div>
  );
}
