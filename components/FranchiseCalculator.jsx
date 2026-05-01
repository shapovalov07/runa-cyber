'use client';

import { useState } from 'react';
import { franchiseCalculatorFormats } from '../data/franchise';
import { trackFranchiseEvent } from '../lib/franchise-analytics';
import FranchiseForm from './FranchiseForm';

const METRIC_DEFINITIONS = [
  { key: 'investment', label: 'Инвестиции' },
  { key: 'revenue', label: 'Выручка' },
  { key: 'expenses', label: 'Расходы' },
  { key: 'profit', label: 'Прибыль', featured: true },
  { key: 'payback', label: 'Окупаемость' },
];

export default function FranchiseCalculator() {
  const [activeSlug, setActiveSlug] = useState(franchiseCalculatorFormats[2]?.slug || franchiseCalculatorFormats[0]?.slug || '');
  const activeFormat = franchiseCalculatorFormats.find((item) => item.slug === activeSlug) || franchiseCalculatorFormats[0];

  if (!activeFormat) return null;

  return (
    <div className="franchise-calculator-shell">
      <div className="franchise-calculator-panel">
        <div className="franchise-calculator-head">
          <div>
            <p className="kicker">Финансовая модель</p>
            <h3>Выберите формат клуба и посмотрите ориентиры по экономике</h3>
          </div>
          <p>
            Модель рассчитывается индивидуально под город, помещение и концепцию. Ниже показаны базовые ориентиры по
            форматам RUNA.
          </p>
        </div>

        <div className="franchise-calculator-switcher">
          {franchiseCalculatorFormats.map((item) => (
            <button
              key={item.slug}
              className={`franchise-calculator-tab ${item.slug === activeFormat.slug ? 'is-active' : ''}`}
              type="button"
              onClick={() => {
                setActiveSlug(item.slug);
                trackFranchiseEvent('franchise_calculator_change', {
                  format: item.label,
                });
              }}
              data-metrika-event="franchise_calculator_change"
              data-metrika-source="calculator_switcher"
              data-metrika-label={item.label}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="franchise-calculator-caption">
          <span>{activeFormat.ps}</span>
          <span>{activeFormat.area}</span>
          <span>Премиальная конфигурация RUNA</span>
        </div>

        <div className="franchise-calculator-grid">
          {METRIC_DEFINITIONS.map((metric) => (
            <article
              key={metric.key}
              className={`franchise-calculator-card ${metric.featured ? 'is-featured' : ''}`}
            >
              <span>{metric.label}</span>
              <strong>{activeFormat[metric.key]}</strong>
            </article>
          ))}
        </div>

        <p className="franchise-calculator-note">
          Финансовая модель является ориентировочной. Точный расчет формируется индивидуально под город, помещение,
          формат клуба и концепцию запуска.
        </p>
      </div>

      <div className="franchise-calculator-form">
        <FranchiseForm
          source="calculator_form"
          title="Получить расчет под мой город"
          description="Оставьте контакты, и команда RUNA подготовит расчет под ваш формат и локацию."
          submitLabel="Получить расчет"
          compact
          showBudget
          showFormat={false}
          showComment={false}
          lockedFormat={activeFormat.label}
        />
      </div>
    </div>
  );
}
