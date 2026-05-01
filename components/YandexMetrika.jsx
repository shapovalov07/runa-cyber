'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const sendMetrikaGoal = (goal, params = {}) => {
  if (typeof window === 'undefined' || !METRIKA_ID) return;
  if (typeof window.ym !== 'function') return;

  window.ym(Number(METRIKA_ID), 'reachGoal', goal, params);
};

export default function YandexMetrika() {
  useEffect(() => {
    if (!METRIKA_ID) return undefined;

    const onTrackedClick = (event) => {
      const target = event.target instanceof Element ? event.target.closest('[data-metrika-event]') : null;
      if (!target) return;

      const goal = getText(target.getAttribute('data-metrika-event'));
      if (!goal) return;

      sendMetrikaGoal(goal, {
        source: getText(target.getAttribute('data-metrika-source')),
        label: getText(target.getAttribute('data-metrika-label')),
      });
    };

    const onCustomEvent = (event) => {
      const detail = event.detail && typeof event.detail === 'object' ? event.detail : {};
      const goal = getText(detail.goal);
      if (!goal) return;
      sendMetrikaGoal(goal, detail.params && typeof detail.params === 'object' ? detail.params : {});
    };

    document.addEventListener('click', onTrackedClick);
    window.addEventListener('runa:metrika', onCustomEvent);

    return () => {
      document.removeEventListener('click', onTrackedClick);
      window.removeEventListener('runa:metrika', onCustomEvent);
    };
  }, []);

  if (!METRIKA_ID) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
          })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${Number(METRIKA_ID)}, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true
          });
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${METRIKA_ID}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
