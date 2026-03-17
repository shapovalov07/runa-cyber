'use client';

import { useEffect, useMemo, useState } from 'react';

export default function ClubsSelector({ cities }) {
  const safeCities = Array.isArray(cities) ? cities : [];

  const allClubs = useMemo(
    () =>
      safeCities.flatMap((city) =>
        (city.clubs ?? []).map((club) => ({
          city,
          club,
        })),
      ),
    [safeCities],
  );

  const firstClubId = allClubs[0]?.club?.id ?? '';
  const [selectedClubId, setSelectedClubId] = useState(firstClubId);

  useEffect(() => {
    if (!allClubs.length) return;
    if (!allClubs.some((entry) => entry.club.id === selectedClubId)) {
      setSelectedClubId(firstClubId);
    }
  }, [allClubs, firstClubId, selectedClubId]);

  const selectedEntry = useMemo(
    () => allClubs.find((entry) => entry.club.id === selectedClubId) ?? allClubs[0] ?? null,
    [allClubs, selectedClubId],
  );

  if (!selectedEntry) {
    return null;
  }

  const { city, club } = selectedEntry;
  const clubZones =
    Array.isArray(club.zones) && club.zones.length > 0
      ? club.zones
      : (club.devices ?? []).map((item) => ({
          name: 'Конфигурация',
          specs: [item],
        }));

  return (
    <>
      <section className="section">
        <div className="container">
          <article className="card reveal clubs-picker">
            <h2 className="section-title">Выбор города и клуба</h2>
            <p className="section-lead">Нажмите на клуб, и ниже покажется информация только по нему.</p>
            <div className="clubs-picker-grid">
              {safeCities.map((cityItem) => (
                <div className="clubs-picker-city" key={cityItem.slug}>
                  <p className="badge clubs-picker-city-link">{cityItem.city}</p>
                  <div className="clubs-picker-links">
                    {(cityItem.clubs ?? []).map((cityClub) => {
                      const isActive = cityClub.id === selectedClubId;
                      return (
                        <button
                          key={cityClub.id}
                          type="button"
                          className={`clubs-picker-link${isActive ? ' is-active' : ''}`}
                          onClick={() => setSelectedClubId(cityClub.id)}
                          aria-pressed={isActive}
                        >
                          {cityClub.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container clubs-selected-layout">
          <div className="clubs-city-head">
            <h2 className="section-title">{city.city}</h2>
            <span className="badge">Выбран клуб</span>
          </div>
          <p className="section-lead">{city.lead}</p>

          <article className="card club-card">
            <div className="club-card-head">
              <h3>{club.name}</h3>
              <a className="btn btn-outline club-vk-link" href={club.vk} target="_blank" rel="noopener noreferrer">
                VK
              </a>
            </div>

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

            <div className="club-card-segment club-card-segment-configs">
              <p className="club-card-segment-title">Конфигурации и зоны</p>
              <div className="club-config-grid">
                {clubZones.map((zone) => (
                  <article className="club-zone-card" key={`${club.id}-${zone.name}`}>
                    <p className="club-zone-name">{zone.name}</p>
                    <ul className="club-zone-list">
                      {(zone.specs ?? []).map((item) => (
                        <li key={`${zone.name}-${item}`}>{item}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>

            {Array.isArray(club.extras) && club.extras.length > 0 ? (
              <div className="club-card-segment">
                <p className="club-card-segment-title">Дополнительно</p>
                <ul>
                  {club.extras.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        </div>
      </section>
    </>
  );
}
