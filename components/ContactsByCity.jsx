'use client';

import { useEffect, useMemo, useState } from 'react';

export default function ContactsByCity({ cities }) {
  const safeCities = useMemo(() => (Array.isArray(cities) ? cities : []), [cities]);
  const [selectedCitySlug, setSelectedCitySlug] = useState(safeCities[0]?.slug ?? '');

  useEffect(() => {
    if (!safeCities.length) return;
    if (!safeCities.some((city) => city.slug === selectedCitySlug)) {
      setSelectedCitySlug(safeCities[0].slug);
    }
  }, [safeCities, selectedCitySlug]);

  const selectedCity = safeCities.find((city) => city.slug === selectedCitySlug) ?? safeCities[0] ?? null;

  if (!selectedCity) {
    return null;
  }

  return (
    <>
      <section className="section" id="contacts-by-city">
        <div className="container">
          <article className="card reveal clubs-picker contacts-picker">
            <h2 className="section-title">Контакты по городам</h2>
            <p className="section-lead">Нажмите на город и получите прямую линию к клубу: адрес, телефон и VK для быстрой записи.</p>
            <div className="contacts-city-buttons">
              {safeCities.map((city) => {
                const isActive = city.slug === selectedCitySlug;
                return (
                  <button
                    key={city.slug}
                    type="button"
                    className={`clubs-picker-link${isActive ? ' is-active' : ''}`}
                    onClick={() => setSelectedCitySlug(city.slug)}
                    aria-pressed={isActive}
                  >
                    {city.city}
                  </button>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container contacts-city-layout">
          <div className="clubs-city-head">
            <h2 className="section-title">{selectedCity.city}</h2>
            <span className="badge">Контакты города</span>
          </div>
          <p className="section-lead">{selectedCity.lead}</p>

          <div className="grid grid-2 contacts-city-grid">
            {(selectedCity.clubs ?? []).map((club) => (
              <article className="card contact-city-card" key={club.id}>
                <h3>{club.name}</h3>

                <ul className="club-meta-list">
                  <li>
                    <strong>Адрес:</strong> {club.address}
                  </li>
                  <li>
                    <strong>Телефон:</strong> <a href={`tel:${club.phone.replace(/[^+\d]/g, '')}`}>{club.phone}</a>
                  </li>
                  {club.site ? (
                    <li>
                      <strong>Сайт:</strong>{' '}
                      <a href={club.site} target="_blank" rel="noopener noreferrer">
                        {club.site.replace('https://', '')}
                      </a>
                    </li>
                  ) : null}
                </ul>

                <div className="contact-city-actions">
                  <a className="btn btn-primary" href={`tel:${club.phone.replace(/[^+\d]/g, '')}`}>
                    Позвонить
                  </a>
                  <a className="btn btn-outline" href={club.vk} target="_blank" rel="noopener noreferrer">
                    Написать в VK
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
