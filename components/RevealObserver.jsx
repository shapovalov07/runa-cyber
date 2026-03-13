'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const items = Array.from(document.querySelectorAll('.reveal'));
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    items.forEach((item) => {
      item.classList.remove('is-visible');
      observer.observe(item);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
