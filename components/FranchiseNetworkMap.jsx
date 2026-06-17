'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { trackFranchiseEvent } from '../lib/franchise-analytics';

const FILTERS = [
  { value: 'all', label: 'Все точки' },
  { value: 'own', label: 'Собственные' },
  { value: 'franchise', label: 'Франчайзинговые' },
  { value: 'opening', label: 'На этапе открытия' },
];

const CATEGORY_META = {
  own: {
    label: 'Клуб сети',
    legend: 'Собственные клубы',
  },
  franchise: {
    label: 'Франчайзи',
    legend: 'Партнерские точки',
  },
  opening: {
    label: 'Открытие',
    legend: 'Скоро открытие',
  },
  mixed: {
    label: 'Несколько форматов',
    legend: 'Смешанный формат',
  },
};

const CITY_MAP_META = {
  Воронеж: { lon: 39.200269, lat: 51.660781, zoom: 12 },
  Саратов: { lon: 46.047767, lat: 51.525923, zoom: 14 },
  'Ростов-на-Дону': { lon: 39.717809, lat: 47.226888, zoom: 13 },
  Челябинск: { lon: 61.386096, lat: 55.155057, zoom: 12 },
};

const LOCATION_COORDS = {
  'vrn-plekhanovskaya': { lon: 39.20409, lat: 51.657836, dx: -22, dy: -18 },
  'vrn-moiseeva': { lon: 39.180262, lat: 51.652333, dx: -10, dy: 18 },
  'vrn-nevskogo': { lon: 39.1665, lat: 51.717686, dx: 12, dy: -28 },
  'vrn-dimitrova': { lon: 39.278247, lat: 51.661361, dx: 24, dy: 10 },
  'saratov-lermontova': { lon: 46.047767, lat: 51.525923, dx: 0, dy: 0 },
  'rostov-stanislavskogo': { lon: 39.72161, lat: 47.219146, dx: -18, dy: 10 },
  'rostov-voroshilovsky': { lon: 39.714008, lat: 47.234629, dx: 18, dy: -12 },
  'chelyabinsk-tsvillinga': { lon: 61.407175, lat: 55.157285, dx: -16, dy: 14 },
  'chelyabinsk-lesoparkovaya': { lon: 61.365278, lat: 55.156667, dx: 16, dy: -14 },
};

const STATIC_MAP_SIZE = '650,450';
const ALL_NETWORK_MAP_CENTER = { lon: 50.3, lat: 51.2, zoom: 5 };
const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY || '';

const MAP_BOUNDS = {
  minLon: 38.4,
  maxLon: 62.2,
  minLat: 46.7,
  maxLat: 55.6,
};

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const pluralize = (count, one, few, many) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
};

const toUniqueList = (values) => Array.from(new Set(values.filter(Boolean)));

const getVisibleItems = (items, filter) => {
  if (filter === 'all') return items;
  return items.filter((item) => item.category === filter);
};

const getMarkerCategory = (counts) => {
  const activeCategories = ['own', 'franchise', 'opening'].filter((key) => counts[key] > 0);
  if (activeCategories.length > 1) return 'mixed';
  return activeCategories[0] || 'own';
};

const buildSummaryText = (counts) => {
  const parts = [];

  if (counts.own > 0) {
    parts.push(`${counts.own} ${pluralize(counts.own, 'клуб сети', 'клуба сети', 'клубов сети')}`);
  }

  if (counts.franchise > 0) {
    parts.push(`${counts.franchise} ${pluralize(counts.franchise, 'партнерская точка', 'партнерские точки', 'партнерских точек')}`);
  }

  if (counts.opening > 0) {
    parts.push(`${counts.opening} ${pluralize(counts.opening, 'точка на открытии', 'точки на открытии', 'точек на открытии')}`);
  }

  return parts.join(' • ');
};

const buildCityGroups = (items) => {
  const groups = new Map();

  items.forEach((item) => {
    const city = getText(item.city);
    if (!city) return;

    if (!groups.has(city)) {
      groups.set(city, {
        city,
        locations: [],
      });
    }

    groups.get(city).locations.push(item);
  });

  return Array.from(groups.values()).map((group) => {
    const counts = {
      own: group.locations.filter((item) => item.category === 'own').length,
      franchise: group.locations.filter((item) => item.category === 'franchise').length,
      opening: group.locations.filter((item) => item.category === 'opening').length,
    };

    return {
      ...group,
      counts,
      total: group.locations.length,
      markerCategory: getMarkerCategory(counts),
      formats: toUniqueList(group.locations.map((item) => getText(item.format))).slice(0, 3),
      summaryText: buildSummaryText(counts),
      headline:
        group.locations.length === 1
          ? group.locations[0].highlight
          : `${group.city} показывает, что модель RUNA работает в нескольких форматах внутри одного рынка.`,
    };
  });
};

const formatLocationsCount = (count) => `${count} ${pluralize(count, 'точка', 'точки', 'точек')}`;

const renderLocationStatus = (status) => {
  const value = getText(status);
  return value || 'Точка сети';
};

const buildLocationQuery = (item) => {
  const city = getText(item?.city);
  const address = getText(item?.address);
  return ['RUNA Cyber Club', city, address].filter(Boolean).join(', ');
};

const buildCityQuery = (group) => {
  const city = getText(group?.city);
  return ['RUNA Cyber Club', city].filter(Boolean).join(', ');
};

const buildYandexSearchUrl = (group, activeLocation) => {
  const query = activeLocation
    ? buildLocationQuery(activeLocation)
    : group?.city === 'Вся сеть RUNA'
      ? 'RUNA Cyber Club'
      : buildCityQuery(group);
  const params = new URLSearchParams();

  if (activeLocation) {
    const cityMeta = CITY_MAP_META[getText(activeLocation.city)] || CITY_MAP_META['Воронеж'];
    const point = LOCATION_COORDS[activeLocation.id] || cityMeta;
    params.set('ll', `${point.lon},${point.lat}`);
    params.set('mode', 'whatshere');
    params.set('whatshere[point]', `${point.lon},${point.lat}`);
    params.set('whatshere[zoom]', '17');
    params.set('z', '17');
    return `https://yandex.ru/maps/?${params.toString()}`;
  }

  if (group?.city && group.city !== 'Вся сеть RUNA') {
    const cityMeta = CITY_MAP_META[getText(group.city)] || CITY_MAP_META['Воронеж'];
    params.set('ll', `${cityMeta.lon},${cityMeta.lat}`);
    params.set('z', String(cityMeta.zoom || 12));
  }

  params.set('text', query || 'RUNA Cyber Club');

  return `https://yandex.ru/maps/?${params.toString()}`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getLocationMapPoint = (item) => {
  const cityMeta = CITY_MAP_META[getText(item?.city)] || CITY_MAP_META['Воронеж'];
  const point = LOCATION_COORDS[item?.id] || cityMeta;
  const x = ((point.lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * 100;
  const y = ((MAP_BOUNDS.maxLat - point.lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;

  return {
    x: clamp(x, 4, 96),
    y: clamp(y, 5, 94),
    dx: point.dx || 0,
    dy: point.dy || 0,
  };
};

const getStaticMapMarker = () => 'pm2rdm';

const getYandexCoords = (item) => {
  const cityMeta = CITY_MAP_META[getText(item?.city)] || CITY_MAP_META['Воронеж'];
  const point = LOCATION_COORDS[item?.id] || cityMeta;
  return [point.lat, point.lon];
};

const loadYandexMapsApi = () => {
  if (typeof window === 'undefined') return Promise.reject(new Error('Yandex Maps API is browser-only'));
  if (window.ymaps) return Promise.resolve(window.ymaps);
  if (window.__runaYandexMapsPromise) return window.__runaYandexMapsPromise;

  window.__runaYandexMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('runa-yandex-maps-api');

    if (existingScript) {
      existingScript.addEventListener('load', () => window.ymaps?.ready(() => resolve(window.ymaps)), { once: true });
      existingScript.addEventListener('error', reject, { once: true });
      return;
    }

    const params = new URLSearchParams({ lang: 'ru_RU' });
    if (YANDEX_MAPS_API_KEY) params.set('apikey', YANDEX_MAPS_API_KEY);

    const script = document.createElement('script');
    script.id = 'runa-yandex-maps-api';
    script.src = `https://api-maps.yandex.ru/2.1/?${params.toString()}`;
    script.async = true;
    script.onload = () => window.ymaps?.ready(() => resolve(window.ymaps));
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return window.__runaYandexMapsPromise;
};

const buildStaticYandexMapUrl = (items, activeCity) => {
  const cityCenter = activeCity !== 'all' ? CITY_MAP_META[activeCity] : null;
  const center = cityCenter ? { ...cityCenter, zoom: cityCenter.zoom || 12 } : ALL_NETWORK_MAP_CENTER;
  const points = items
    .map((item) => {
      const cityMeta = CITY_MAP_META[getText(item?.city)] || CITY_MAP_META['Воронеж'];
      const point = LOCATION_COORDS[item?.id] || cityMeta;
      return `${point.lon},${point.lat},${getStaticMapMarker(item.category)}`;
    })
    .join('~');
  const params = new URLSearchParams({
    l: 'map',
    size: STATIC_MAP_SIZE,
    ll: `${center.lon},${center.lat}`,
    z: String(center.zoom),
  });

  if (points) params.set('pt', points);

  return `https://static-maps.yandex.ru/1.x/?${params.toString()}`;
};


const buildNetworkGroup = (items) => {
  const counts = {
    own: items.filter((item) => item.category === 'own').length,
    franchise: items.filter((item) => item.category === 'franchise').length,
    opening: items.filter((item) => item.category === 'opening').length,
  };

  return {
    city: 'Вся сеть RUNA',
    locations: items,
    counts,
    total: items.length,
    markerCategory: getMarkerCategory(counts),
    formats: toUniqueList(items.map((item) => getText(item.format))).slice(0, 4),
    summaryText: buildSummaryText(counts),
    headline: 'Все действующие и готовящиеся к открытию точки показаны на одной карте сети.',
  };
};

export default function FranchiseNetworkMap({ items = [] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const filteredItems = useMemo(() => getVisibleItems(items, activeFilter), [items, activeFilter]);
  const visibleCities = useMemo(() => buildCityGroups(filteredItems), [filteredItems]);
  const [activeCity, setActiveCity] = useState('all');
  const [activeLocationId, setActiveLocationId] = useState('');
  const [isLiveMapReady, setIsLiveMapReady] = useState(false);
  const liveMapNodeRef = useRef(null);
  const liveMapInstanceRef = useRef(null);

  useEffect(() => {
    if (activeCity === 'all' || visibleCities.some((item) => item.city === activeCity)) return;
    setActiveCity('all');
  }, [activeCity, visibleCities]);

  const visibleMapItems = activeCity === 'all' ? filteredItems : filteredItems.filter((item) => item.city === activeCity);
  const activeCityGroup =
    activeCity === 'all' ? buildNetworkGroup(visibleMapItems) : visibleCities.find((item) => item.city === activeCity) || null;
  const selectedLocation = activeCityGroup?.locations.find((item) => item.id === activeLocationId) || null;
  const activeLocation = selectedLocation || (activeCity === 'all' ? null : activeCityGroup?.locations[0] || null);
  const yandexSearchUrl = activeCityGroup ? buildYandexSearchUrl(activeCityGroup, activeLocation) : '';
  const staticMapUrl = buildStaticYandexMapUrl(visibleMapItems, activeCity);

  useEffect(() => {
    let isCancelled = false;

    loadYandexMapsApi()
      .then((ymaps) => {
        if (isCancelled || !liveMapNodeRef.current || liveMapInstanceRef.current) return;

        liveMapInstanceRef.current = new ymaps.Map(
          liveMapNodeRef.current,
          {
            center: [ALL_NETWORK_MAP_CENTER.lat, ALL_NETWORK_MAP_CENTER.lon],
            zoom: ALL_NETWORK_MAP_CENTER.zoom,
            controls: ['zoomControl', 'fullscreenControl'],
          },
          {
            suppressMapOpenBlock: true,
            yandexMapDisablePoiInteractivity: true,
          },
        );

        window.requestAnimationFrame(() => {
          liveMapInstanceRef.current?.container?.fitToViewport?.();
        });
        setIsLiveMapReady(true);
      })
      .catch(() => {
        if (!isCancelled) setIsLiveMapReady(false);
      });

    return () => {
      isCancelled = true;
      if (liveMapInstanceRef.current) {
        liveMapInstanceRef.current.destroy();
        liveMapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isLiveMapReady || !liveMapNodeRef.current || !liveMapInstanceRef.current) return undefined;

    const map = liveMapInstanceRef.current;
    let frameId = 0;
    const fitToViewport = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        frameId = 0;
        map.container?.fitToViewport?.();
      });
    };
    const resizeObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(fitToViewport) : null;

    fitToViewport();
    resizeObserver?.observe(liveMapNodeRef.current);
    window.addEventListener('resize', fitToViewport);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', fitToViewport);
    };
  }, [isLiveMapReady]);

  useEffect(() => {
    if (!isLiveMapReady || !liveMapInstanceRef.current || typeof window === 'undefined' || !window.ymaps) return;

    const ymaps = window.ymaps;
    const map = liveMapInstanceRef.current;
    const collection = new ymaps.GeoObjectCollection();

    visibleMapItems.forEach((item) => {
      const isActive = item.id === activeLocation?.id;
      const placemark = new ymaps.Placemark(
        getYandexCoords(item),
        {
          hintContent: `${item.city}, ${item.address}`,
          balloonContentHeader: item.city,
          balloonContentBody: `
            <strong>${renderLocationStatus(item.status)}</strong><br/>
            ${item.address}<br/>
            <span>${item.format}</span>
          `,
          balloonContentFooter: getText(item.highlight),
        },
        {
          preset: 'islands#redIcon',
        },
      );

      placemark.events.add('click', () => {
        setActiveCity(item.city);
        setActiveLocationId(item.id);
        trackFranchiseEvent('franchise_network_select', {
          city: item.city,
          category: item.category,
          location: item.id,
          source: 'live_yandex_map',
        });
      });

      collection.add(placemark);
    });

    map.geoObjects.removeAll();
    map.geoObjects.add(collection);
    map.container?.fitToViewport?.();

    if (visibleMapItems.length === 1) {
      map.setCenter(getYandexCoords(visibleMapItems[0]), 13, { duration: 300 });
    } else {
      const bounds = collection.getBounds();
      if (bounds) {
        map.setBounds(bounds, {
          checkZoomRange: true,
          duration: 300,
          zoomMargin: 56,
        });
      }
    }
  }, [activeLocation?.id, isLiveMapReady, visibleMapItems]);

  return (
    <div className="franchise-network-shell">
      <div className="franchise-network-stage-card">
        <div className="franchise-network-toolbar">
          <div className="franchise-network-filters">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                className={`franchise-network-filter ${filter.value === activeFilter ? 'is-active' : ''}`}
                type="button"
                onClick={() => {
                  setActiveFilter(filter.value);
                  setActiveLocationId('');
                  setActiveCity('all');
                  trackFranchiseEvent('franchise_network_filter', {
                    filter: filter.value,
                  });
                }}
                data-metrika-event="franchise_network_filter"
                data-metrika-source="network_filters"
                data-metrika-label={filter.value}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="franchise-network-legend">
            {['own', 'franchise', 'opening'].map((key) => (
              <span className={`franchise-network-legend-item is-${key}`} key={key}>
                <i />
                {CATEGORY_META[key].legend}
              </span>
            ))}
          </div>
        </div>

        <div className={`franchise-network-stage ${isLiveMapReady ? 'is-live' : ''}`}>
          <img className="franchise-network-yandex-map" src={staticMapUrl} alt="Яндекс Карта сети RUNA" loading="lazy" />
          <div className="franchise-network-live-map" ref={liveMapNodeRef} aria-label="Живая Яндекс Карта сети RUNA" />

          {!isLiveMapReady ? (
            <div className="franchise-network-map-canvas" aria-label="Кликабельные точки сети RUNA">
              {visibleMapItems.map((item) => {
                const point = getLocationMapPoint(item);
                const isActive = item.id === activeLocation?.id;

                return (
                  <button
                    className={`franchise-network-location-pin is-${item.category} ${
                      point.x > 72 ? 'is-west-label' : ''
                    } ${point.y > 72 ? 'is-north-label' : ''} ${isActive ? 'is-active' : ''}`}
                    key={item.id}
                    type="button"
                    style={{
                      left: `${point.x}%`,
                      top: `${point.y}%`,
                      '--pin-offset-x': `${point.dx}px`,
                      '--pin-offset-y': `${point.dy}px`,
                    }}
                    onClick={() => {
                      setActiveCity(item.city);
                      setActiveLocationId(item.id);
                      trackFranchiseEvent('franchise_network_select', {
                        city: item.city,
                        category: item.category,
                        location: item.id,
                      });
                    }}
                    data-metrika-event="franchise_network_select"
                    data-metrika-source="network_map"
                    data-metrika-label={item.id}
                  >
                    <span className="franchise-network-location-core" />
                    <span className="franchise-network-location-label">
                      <strong>{item.city}</strong>
                      <em>{item.address}</em>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {yandexSearchUrl ? (
            <a
              className="franchise-network-map-link"
              href={yandexSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackFranchiseEvent('franchise_network_open_yandex', {
                  city: activeCityGroup?.city,
                  location: activeLocation?.id,
                });
              }}
            >
              Открыть в Яндекс Картах
            </a>
          ) : null}
        </div>

        <div className="franchise-network-city-strip" aria-label="Города сети RUNA">
          <button
            className={`franchise-network-city-pin is-${buildNetworkGroup(filteredItems).markerCategory} ${
              activeCity === 'all' ? 'is-active' : ''
            }`}
            type="button"
            onClick={() => {
              setActiveCity('all');
              setActiveLocationId('');
              trackFranchiseEvent('franchise_network_select', {
                city: 'all',
                category: 'all',
              });
            }}
            data-metrika-event="franchise_network_select"
            data-metrika-source="network_city_strip"
            data-metrika-label="all"
          >
            <span />
            <strong>Вся сеть</strong>
            <em>{formatLocationsCount(filteredItems.length)}</em>
          </button>
          {visibleCities.map((city) => (
            <button
              key={city.city}
              className={`franchise-network-city-pin is-${city.markerCategory} ${
                city.city === activeCityGroup?.city ? 'is-active' : ''
              }`}
              type="button"
              onClick={() => {
                setActiveCity(city.city);
                setActiveLocationId(city.locations[0]?.id || '');
                trackFranchiseEvent('franchise_network_select', {
                  city: city.city,
                  category: city.markerCategory,
                  location: city.locations[0]?.id,
                });
              }}
              data-metrika-event="franchise_network_select"
              data-metrika-source="network_city_strip"
              data-metrika-label={city.city}
            >
              <span />
              <strong>{city.city}</strong>
              <em>{formatLocationsCount(city.total)}</em>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
