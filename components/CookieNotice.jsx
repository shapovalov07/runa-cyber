'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const COOKIE_NAME = 'runa_cookie_notice_accepted';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const hasAcceptedCookieNotice = () =>
  typeof document !== 'undefined' &&
  document.cookie
    .split(';')
    .map((item) => item.trim())
    .some((item) => item.startsWith(`${COOKIE_NAME}=`));

export default function CookieNotice() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    setIsVisible(!hasAcceptedCookieNotice());
  }, [pathname]);

  const acceptCookies = () => {
    document.cookie = `${COOKIE_NAME}=1; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside className="cookie-notice" role="dialog" aria-label="Уведомление об использовании cookies">
      <div className="cookie-notice-copy">
        <h2>Мы используем cookies</h2>
        <p>
          Это помогает сайту стабильно работать, улучшать сервис RUNA и анализировать качество обслуживания. Продолжая
          использовать сайт, вы соглашаетесь с использованием cookies.
        </p>
      </div>
      <span className="cookie-notice-icon" aria-hidden="true" />
      <div className="cookie-notice-actions">
        <button className="cookie-notice-button" type="button" onClick={acceptCookies}>
          Понятно
        </button>
        <a className="cookie-notice-link" href="/privacy-policy">
          Политика конфиденциальности
        </a>
      </div>
    </aside>
  );
}
