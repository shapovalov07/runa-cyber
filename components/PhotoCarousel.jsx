'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export default function PhotoCarousel({ items }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const metricsRef = useRef({ step: 1, maxPage: 0, pages: 1 });
  const activePageRef = useRef(0);
  const pageCountRef = useRef(1);
  const [activePage, setActivePage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);
  const [failedSrcSet, setFailedSrcSet] = useState(() => new Set());

  const safeItems = useMemo(() => items ?? [], [items]);
  const itemsSignature = useMemo(
    () => safeItems.map((item) => `${String(item?.id ?? '')}:${String(item?.src ?? '')}`).join('|'),
    [safeItems],
  );
  const visibleItems = useMemo(() => {
    if (failedSrcSet.size === 0) return safeItems;
    return safeItems.filter((item) => !failedSrcSet.has(item?.src));
  }, [failedSrcSet, safeItems]);
  const isLightboxOpen = lightboxIndex >= 0 && lightboxIndex < visibleItems.length;
  const lightboxItem = isLightboxOpen ? visibleItems[lightboxIndex] : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFailedSrcSet(new Set());
    setLightboxIndex(-1);
  }, [itemsSignature]);

  useEffect(() => {
    if (visibleItems.length > 0) return;
    setLightboxIndex(-1);
  }, [visibleItems.length]);

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

    const updateMetrics = () => {
      const firstItem = track.querySelector('.carousel-item');
      if (!firstItem) {
        const fallback = {
          step: viewport.clientWidth,
          maxPage: 0,
          pages: 1,
        };
        metricsRef.current = fallback;
        setPageCount(1);
        setActivePage(0);
        return;
      }

      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || '0');
      const itemWidth = firstItem.getBoundingClientRect().width;
      const step = Math.max(1, itemWidth + gap);
      const visibleCount = Math.max(1, Math.round((viewport.clientWidth + gap) / step));
      const maxPage = Math.max(0, visibleItems.length - visibleCount);
      const pages = maxPage + 1;

      metricsRef.current = {
        step,
        maxPage,
        pages,
      };

      const nextPage = step > 0 ? Math.round(viewport.scrollLeft / step) : 0;
      const clampedPage = Math.min(maxPage, Math.max(0, nextPage));

      setPageCount(pages);
      setActivePage(clampedPage);
    };

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        const { step, maxPage } = metricsRef.current;
        const nextPage = step > 0 ? Math.round(viewport.scrollLeft / step) : 0;
        const clampedPage = Math.min(maxPage, Math.max(0, nextPage));
        if (clampedPage !== activePageRef.current) {
          setActivePage(clampedPage);
        }
      });
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateMetrics);

    updateMetrics();

    return () => {
      viewport.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateMetrics);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [visibleItems.length]);

  const goToPage = useCallback((page) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const { step, maxPage } = metricsRef.current;
    const targetPage = Math.min(maxPage, Math.max(0, page));
    const targetLeft = targetPage * step;

    viewport.scrollTo({ left: targetLeft, behavior: 'smooth' });
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(-1);
  }, []);

  const showPrevInLightbox = useCallback(() => {
    if (!visibleItems.length) return;
    setLightboxIndex((prev) => (prev <= 0 ? visibleItems.length - 1 : prev - 1));
  }, [visibleItems.length]);

  const showNextInLightbox = useCallback(() => {
    if (!visibleItems.length) return;
    setLightboxIndex((prev) => (prev + 1) % visibleItems.length);
  }, [visibleItems.length]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeLightbox();
      } else if (event.key === 'ArrowLeft') {
        showPrevInLightbox();
      } else if (event.key === 'ArrowRight') {
        showNextInLightbox();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeLightbox, isLightboxOpen, showNextInLightbox, showPrevInLightbox]);

  useEffect(() => {
    if (visibleItems.length < 2 || isLightboxOpen) return;

    const intervalId = window.setInterval(() => {
      const totalPages = pageCountRef.current;
      if (totalPages <= 1) return;

      const nextPage = (activePageRef.current + 1) % totalPages;
      goToPage(nextPage);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [goToPage, isLightboxOpen, visibleItems.length]);

  const markImageFailed = useCallback((src) => {
    if (!src) return;

    setFailedSrcSet((prev) => {
      if (prev.has(src)) return prev;
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  }, []);

  return (
    <div className="carousel reveal" aria-label="Карусель фото клуба">
      {visibleItems.length === 0 ? (
        <p className="carousel-empty">Фото для выбранного города пока не добавлены.</p>
      ) : (
        <div className="carousel-viewport" ref={viewportRef}>
          <div className="carousel-track" ref={trackRef}>
            {visibleItems.map((item, index) => {
              const itemSrc = item?.src;
              const canOpenLightbox = Boolean(itemSrc);

              return (
                <figure className="photo-slide carousel-item" key={`${item.id ?? item.src ?? index}-${index}`}>
                  <button
                    className={`carousel-photo-trigger${canOpenLightbox ? '' : ' is-disabled'}`}
                    type="button"
                    onClick={() => (canOpenLightbox ? setLightboxIndex(index) : null)}
                    aria-label={`Открыть фото ${index + 1} во весь экран`}
                    disabled={!canOpenLightbox}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      loading="lazy"
                      onError={() => markImageFailed(itemSrc)}
                    />
                  </button>
                </figure>
              );
            })}
          </div>
        </div>
      )}

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

      {mounted &&
        isLightboxOpen &&
        lightboxItem &&
        createPortal(
          <div className="photo-lightbox" role="dialog" aria-modal="true" aria-label="Просмотр фото">
            <button className="photo-lightbox-backdrop" type="button" onClick={closeLightbox} aria-label="Закрыть просмотр" />

            <div className="photo-lightbox-shell">
              <button className="photo-lightbox-close" type="button" onClick={closeLightbox} aria-label="Закрыть">
                ×
              </button>

              {visibleItems.length > 1 && (
                <>
                  <button
                    className="photo-lightbox-arrow is-prev"
                    type="button"
                    onClick={showPrevInLightbox}
                    aria-label="Предыдущее фото"
                  >
                    ‹
                  </button>
                  <button
                    className="photo-lightbox-arrow is-next"
                    type="button"
                    onClick={showNextInLightbox}
                    aria-label="Следующее фото"
                  >
                    ›
                  </button>
                </>
              )}

              <figure className="photo-lightbox-figure">
                <img src={lightboxItem.src} alt={lightboxItem.alt} draggable={false} />
                <figcaption className="photo-lightbox-caption">
                  <span>{lightboxItem.alt}</span>
                  <span>
                    {lightboxIndex + 1} / {visibleItems.length}
                  </span>
                </figcaption>
              </figure>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
