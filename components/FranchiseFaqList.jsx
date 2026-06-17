'use client';

import { useState } from 'react';

export default function FranchiseFaqList({ items = [] }) {
  const [openItems, setOpenItems] = useState(() => new Set());

  const toggleItem = (question) => {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(question)) {
        next.delete(question);
      } else {
        next.add(question);
      }
      return next;
    });
  };

  return (
    <div className="franchise-faq-list">
      {items.map((item) => {
        const isOpen = openItems.has(item.question);
        const answerId = `franchise-faq-${item.question.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '')}`;

        return (
          <article className={`franchise-faq-item ${isOpen ? 'is-open' : ''}`} key={item.question}>
            <button
              aria-controls={answerId}
              aria-expanded={isOpen}
              className="franchise-faq-trigger"
              type="button"
              onClick={() => toggleItem(item.question)}
            >
              <span>{item.question}</span>
              <i aria-hidden="true" />
            </button>
            <div className="franchise-faq-panel" id={answerId}>
              <div className="franchise-faq-panel-inner">
                <p>{item.answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
