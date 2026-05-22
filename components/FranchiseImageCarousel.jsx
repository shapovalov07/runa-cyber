'use client';

import { useRef } from 'react';

export default function FranchiseImageCarousel({ items = [] }) {
  const trackRef = useRef(null);

  const scrollToSlide = (index) => {
    const track = trackRef.current;
    if (!track) return;

    const firstSlide = track.querySelector('.franchise-gallery-slide');
    const slideWidth = firstSlide?.getBoundingClientRect().width || track.clientWidth;
    track.scrollBy({
      left: index * (slideWidth + 18) - track.scrollLeft,
      behavior: 'smooth',
    });
  };

  return (
    <div className="franchise-gallery-carousel" aria-label="Галерея RUNA">
      <div className="franchise-gallery-track" ref={trackRef}>
        {items.map((item) => (
          <figure className="franchise-gallery-slide" key={item.src}>
            <img src={item.src} alt={item.alt} loading="lazy" />
          </figure>
        ))}
      </div>

      <div className="franchise-gallery-controls" aria-label="Навигация галереи">
        {items.map((item, index) => (
          <button type="button" key={item.src} onClick={() => scrollToSlide(index)} aria-label={`Фото ${index + 1}`} />
        ))}
      </div>
    </div>
  );
}
