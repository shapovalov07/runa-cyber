'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export default function PhotoCarousel({ items }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const activePageRef = useRef(0);
  const pageCountRef = useRef(1);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const safeItems = useMemo(() => items ?? [], [items]);

  useEffect(() => {
    activePageRef.current = activePage;
  }, [activePage]);

  useEffect(() => {
    pageCountRef.current = pageCount;
  }, [pageCount]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const getMetrics = () => {
      const firstItem = track.querySelector('.carousel-item');
      if (!firstItem) {
        return {
          step: viewport.clientWidth,
          maxPage: 0,
          pages: 1,
        };
      }

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0');
      const itemWidth = firstItem.getBoundingClientRect().width;
      const step = itemWidth + gap;
      const visibleCount = Math.max(1, Math.round((viewport.clientWidth + gap) / step));
      const maxPage = Math.max(0, safeItems.length - visibleCount);

      return {
        step,
        maxPage,
        pages: maxPage + 1,
      };
    };

    const updateCarouselState = () => {
      const { step, maxPage, pages } = getMetrics();
      const nextPage = step > 0 ? Math.round(viewport.scrollLeft / step) : 0;
      const clampedPage = Math.min(maxPage, Math.max(0, nextPage));

      setPageCount(pages);
      setActivePage(clampedPage);
    };

    const onScroll = () => window.requestAnimationFrame(updateCarouselState);

    viewport.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateCarouselState);

    updateCarouselState();

    return () => {
      viewport.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateCarouselState);
    };
  }, [safeItems.length]);

  const goToPage = useCallback((page) => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const firstItem = track.querySelector('.carousel-item');
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    const itemWidth = firstItem ? firstItem.getBoundingClientRect().width : viewport.clientWidth;
    const step = itemWidth + gap;
    const visibleCount = Math.max(1, Math.round((viewport.clientWidth + gap) / step));
    const maxPage = Math.max(0, safeItems.length - visibleCount);
    const targetPage = Math.min(maxPage, Math.max(0, page));

    viewport.scrollTo({ left: targetPage * step, behavior: 'smooth' });
    setActivePage(targetPage);
  }, [safeItems.length]);

  useEffect(() => {
    if (safeItems.length < 2) return;

    const intervalId = window.setInterval(() => {
      const totalPages = pageCountRef.current;
      if (totalPages <= 1) return;

      const nextPage = (activePageRef.current + 1) % totalPages;
      goToPage(nextPage);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [goToPage, safeItems.length]);

  return (
    <div className="carousel reveal" aria-label="Карусель фото клуба">
      <div className="carousel-viewport" ref={viewportRef}>
        <div className="carousel-track" ref={trackRef}>
          {safeItems.map((item) => (
            <figure className="photo-slide carousel-item" key={item.src}>
              <img src={item.src} alt={item.alt} loading="lazy" />
            </figure>
          ))}
        </div>
      </div>

      {pageCount > 1 && (
        <div className="carousel-dots" aria-label="Навигация по галерее">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              key={index}
              type="button"
              className={`carousel-dot ${index === activePage ? 'is-active' : ''}`}
              onClick={() => goToPage(index)}
              aria-label={`Перейти к фото ${index + 1}`}
              aria-current={index === activePage ? 'true' : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
