'use client';

import { useEffect, useMemo, useState } from 'react';
import { trackFranchiseEvent } from '../lib/franchise-analytics';

const FILTERS = [
  { value: 'all', label: 'Все' },
  { value: 'own', label: 'Собственные' },
  { value: 'franchise', label: 'Франчайзинговые' },
  { value: 'opening', label: 'На этапе открытия' },
];

const getVisibleItems = (items, filter) => {
  if (filter === 'all') return items;
  return items.filter((item) => item.category === filter);
};

export default function FranchiseNetworkMap({ items = [] }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const visibleItems = useMemo(() => getVisibleItems(items, activeFilter), [items, activeFilter]);
  const [activeId, setActiveId] = useState(visibleItems[0]?.id || items[0]?.id || '');

  useEffect(() => {
    if (visibleItems.some((item) => item.id === activeId)) return;
    setActiveId(visibleItems[0]?.id || '');
  }, [activeId, visibleItems]);

  const activeItem = visibleItems.find((item) => item.id === activeId) || visibleItems[0] || items[0] || null;

  return (
    <div className="franchise-network-shell">
      <div className="franchise-network-stage-card">
        <div className="franchise-network-filters">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              className={`franchise-network-filter ${filter.value === activeFilter ? 'is-active' : ''}`}
              type="button"
              onClick={() => {
                setActiveFilter(filter.value);
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

        <div className="franchise-network-stage">
          <div className="franchise-network-stage-grid" />
          {visibleItems.map((item) => (
            <button
              key={item.id}
              className={`franchise-network-node ${item.id === activeItem?.id ? 'is-active' : ''} is-${item.category}`}
              type="button"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              onClick={() => {
                setActiveId(item.id);
                trackFranchiseEvent('franchise_network_select', {
                  city: item.city,
                  category: item.category,
                });
              }}
              data-metrika-event="franchise_network_select"
              data-metrika-source="network_map"
              data-metrika-label={item.city}
            >
              <span>{item.city}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="franchise-network-detail-card">
        {activeItem ? (
          <>
            <div className="franchise-network-detail-head">
              <div>
                <p className="kicker">Активная точка</p>
                <h3>{activeItem.city}</h3>
              </div>
              <span className={`franchise-network-status is-${activeItem.category}`}>{activeItem.status}</span>
            </div>
            <p className="admin-path">{activeItem.address}</p>
            <p>{activeItem.highlight}</p>
            <div className="franchise-network-metadata">
              <span>{activeItem.format}</span>
              <span>{activeItem.category === 'own' ? 'Сеть RUNA' : activeItem.category === 'opening' ? 'Открытие' : 'Партнер'}</span>
            </div>
          </>
        ) : (
          <p className="admin-empty">Нет точек для выбранного фильтра.</p>
        )}

        <div className="franchise-network-mini-list">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              className={`franchise-network-mini-card ${item.id === activeItem?.id ? 'is-active' : ''}`}
              type="button"
              onClick={() => setActiveId(item.id)}
            >
              <strong>{item.city}</strong>
              <span>{item.address}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
