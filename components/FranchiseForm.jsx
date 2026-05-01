'use client';

import { useEffect, useRef, useState } from 'react';
import { trackFranchiseEvent } from '../lib/franchise-analytics';

const PHONE_MAX_LENGTH = 18;
const BUDGET_OPTIONS = ['До 10 млн ₽', '10-15 млн ₽', '15-20 млн ₽', '20+ млн ₽'];
const FORMAT_OPTIONS = ['20 ПК', '25 ПК', '30 ПК', '35 ПК', '40 ПК'];

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const createInitialState = (lockedFormat = '') => ({
  name: '',
  phone: '',
  email: '',
  city: '',
  telegramUsername: '',
  budget: '',
  format: getText(lockedFormat),
  comment: '',
  consent: false,
});

const formatPhone = (input) => {
  const digitsOnly = input.replace(/\D/g, '');
  if (!digitsOnly) return '';

  let normalized = digitsOnly;

  if (normalized.startsWith('8')) {
    normalized = `7${normalized.slice(1)}`;
  } else if (!normalized.startsWith('7')) {
    normalized = `7${normalized}`;
  }

  normalized = normalized.slice(0, 11);

  const local = normalized.slice(1);
  let result = '+7';

  if (local.length > 0) {
    result += ` (${local.slice(0, Math.min(3, local.length))}`;
  }
  if (local.length >= 3) {
    result += ')';
  }
  if (local.length > 3) {
    result += ` ${local.slice(3, Math.min(6, local.length))}`;
  }
  if (local.length > 6) {
    result += `-${local.slice(6, Math.min(8, local.length))}`;
  }
  if (local.length > 8) {
    result += `-${local.slice(8, 10)}`;
  }

  return result;
};

const getCaretPositionForDigits = (formattedPhone, digitsBeforeCaret) => {
  if (digitsBeforeCaret <= 0) return 0;

  let digitCount = 0;
  for (let index = 0; index < formattedPhone.length; index += 1) {
    if (/\d/.test(formattedPhone[index])) {
      digitCount += 1;
      if (digitCount === digitsBeforeCaret) {
        return index + 1;
      }
    }
  }

  return formattedPhone.length;
};

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(getText(value));

export default function FranchiseForm({
  source = 'final_form',
  title = '',
  description = '',
  submitLabel = 'Получить расчет',
  compact = false,
  className = '',
  showBudget = !compact,
  showFormat = !compact,
  showComment = !compact,
  lockedFormat = '',
  showSecondaryAction = true,
}) {
  const [form, setForm] = useState(() => createInitialState(lockedFormat));
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const phoneInputRef = useRef(null);
  const cityInputTrackedRef = useRef(false);
  const baseId = `franchise-${source.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'form'}`;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false);
  };

  useEffect(() => {
    if (!getText(lockedFormat)) return;
    setForm((prev) => ({ ...prev, format: getText(lockedFormat) }));
  }, [lockedFormat]);

  useEffect(() => {
    if (!isSuccessPopupOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsSuccessPopupOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSuccessPopupOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!getText(form.name) || !getText(form.city) || !getText(form.phone) || !getText(form.email)) {
      setStatus('error');
      setMessage('Заполните обязательные поля: Имя, Город, Телефон и Email.');
      return;
    }

    const digits = form.phone.replace(/\D/g, '');
    if (digits.length !== 11 || !digits.startsWith('7')) {
      setStatus('error');
      setMessage('Введите телефон в формате +7 (999) 999-99-99.');
      return;
    }

    if (!validateEmail(form.email)) {
      setStatus('error');
      setMessage('Проверьте email.');
      return;
    }

    if (!form.consent) {
      setStatus('error');
      setMessage('Подтвердите согласие на обработку данных.');
      return;
    }

    try {
      setStatus('loading');
      setMessage('Отправляем заявку...');

      const response = await fetch('/api/franchise', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          format: getText(lockedFormat) || getText(form.format),
          source,
          pageUrl: typeof window !== 'undefined' ? window.location.href : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось отправить заявку.');
      }

      trackFranchiseEvent('franchise_form_submit', {
        source,
        format: getText(lockedFormat) || getText(form.format),
      });
      trackFranchiseEvent(`${source}_submit`, {
        source,
      });

      setStatus('success');
      setMessage(payload.message || 'Заявка сохранена. Команда RUNA свяжется с вами.');
      setForm(createInitialState(lockedFormat));
      cityInputTrackedRef.current = false;
      setIsSuccessPopupOpen(true);
    } catch (error) {
      trackFranchiseEvent('franchise_form_error', {
        source,
      });
      setStatus('error');
      setMessage(error.message || 'Ошибка отправки. Попробуйте снова.');
    }
  };

  const handlePhoneChange = (value) => {
    updateField('phone', formatPhone(value));
  };

  const handlePhoneKeyDown = (event) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === 'Backspace' || event.key === 'Delete') {
      const input = event.currentTarget;
      const { selectionStart, selectionEnd, value } = input;
      if (selectionStart === null || selectionEnd === null || selectionStart !== selectionEnd) return;

      const targetIndex = event.key === 'Backspace' ? selectionStart - 1 : selectionStart;
      if (targetIndex < 0 || targetIndex >= value.length) return;
      if (/\d/.test(value[targetIndex])) return;

      event.preventDefault();

      const direction = event.key === 'Backspace' ? -1 : 1;
      let digitIndex = targetIndex;

      while (digitIndex >= 0 && digitIndex < value.length && /\D/.test(value[digitIndex])) {
        digitIndex += direction;
      }

      if (digitIndex < 0 || digitIndex >= value.length) {
        updateField('phone', '');
        return;
      }

      const digitsBeforeRemoved = value.slice(0, digitIndex).replace(/\D/g, '').length;
      const valueWithoutDigit = `${value.slice(0, digitIndex)}${value.slice(digitIndex + 1)}`;
      const formattedPhone = formatPhone(valueWithoutDigit);
      const nextPhone = formattedPhone.replace(/\D/g, '') === '7' ? '' : formattedPhone;
      const nextCaretPosition = getCaretPositionForDigits(nextPhone, digitsBeforeRemoved);

      updateField('phone', nextPhone);

      window.requestAnimationFrame(() => {
        if (!phoneInputRef.current) return;
        phoneInputRef.current.setSelectionRange(nextCaretPosition, nextCaretPosition);
      });
      return;
    }

    if (allowedKeys.includes(event.key)) return;
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  };

  return (
    <>
      <form
        className={`franchise-form ${compact ? 'franchise-form-compact' : ''} ${className}`.trim()}
        onSubmit={handleSubmit}
        noValidate
        data-metrika-source={source}
      >
        {title || description ? (
          <div className="franchise-form-head">
            <div>
              {title ? <h3>{title}</h3> : null}
              {description ? <p>{description}</p> : null}
            </div>
            {getText(lockedFormat) ? <span className="form-chip">Выбран формат: {lockedFormat}</span> : null}
          </div>
        ) : getText(lockedFormat) ? (
          <div className="form-chips">
            <span className="form-chip">Выбран формат: {lockedFormat}</span>
          </div>
        ) : null}

        <div className="form-grid">
          <label className="form-field" htmlFor={`${baseId}-name`}>
            <span>Имя *</span>
            <input
              id={`${baseId}-name`}
              name={`${baseId}-name`}
              type="text"
              placeholder="Ваше имя"
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />
          </label>

          <label className="form-field" htmlFor={`${baseId}-city`}>
            <span>Город *</span>
            <input
              id={`${baseId}-city`}
              name={`${baseId}-city`}
              type="text"
              placeholder="Ваш город"
              autoComplete="address-level2"
              value={form.city}
              onChange={(event) => {
                updateField('city', event.target.value);
                if (source === 'city_check_form' && !cityInputTrackedRef.current && getText(event.target.value).length >= 2) {
                  cityInputTrackedRef.current = true;
                  trackFranchiseEvent('franchise_city_check_input', {
                    source,
                  });
                }
              }}
              required
            />
          </label>

          <label className="form-field" htmlFor={`${baseId}-phone`}>
            <span>Телефон *</span>
            <input
              ref={phoneInputRef}
              id={`${baseId}-phone`}
              name={`${baseId}-phone`}
              type="tel"
              placeholder="+7 (999) 123-45-67"
              autoComplete="tel"
              inputMode="numeric"
              pattern="\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}"
              maxLength={PHONE_MAX_LENGTH}
              value={form.phone}
              onChange={(event) => handlePhoneChange(event.target.value)}
              onKeyDown={handlePhoneKeyDown}
              required
            />
          </label>

          <label className="form-field" htmlFor={`${baseId}-email`}>
            <span>Email *</span>
            <input
              id={`${baseId}-email`}
              name={`${baseId}-email`}
              type="email"
              placeholder="mail@example.com"
              autoComplete="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              required
            />
          </label>

          <label className="form-field full" htmlFor={`${baseId}-telegram`}>
            <span>Telegram username</span>
            <input
              id={`${baseId}-telegram`}
              name={`${baseId}-telegram`}
              type="text"
              placeholder="@username"
              autoComplete="username"
              value={form.telegramUsername}
              onChange={(event) => updateField('telegramUsername', event.target.value)}
            />
          </label>

          {showBudget ? (
            <label className="form-field" htmlFor={`${baseId}-budget`}>
              <span>Ориентировочный бюджет</span>
              <select
                id={`${baseId}-budget`}
                name={`${baseId}-budget`}
                value={form.budget}
                onChange={(event) => updateField('budget', event.target.value)}
              >
                <option value="">Выберите диапазон</option>
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showFormat && !getText(lockedFormat) ? (
            <label className="form-field" htmlFor={`${baseId}-format`}>
              <span>Формат клуба</span>
              <select
                id={`${baseId}-format`}
                name={`${baseId}-format`}
                value={form.format}
                onChange={(event) => updateField('format', event.target.value)}
              >
                <option value="">Выберите формат</option>
                {FORMAT_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {showComment ? (
            <label className="form-field full" htmlFor={`${baseId}-comment`}>
              <span>Комментарий</span>
              <textarea
                id={`${baseId}-comment`}
                name={`${baseId}-comment`}
                placeholder="Кратко о городе, локации, сроках и ожиданиях"
                value={form.comment}
                onChange={(event) => updateField('comment', event.target.value)}
              />
            </label>
          ) : null}
        </div>

        <label className="form-consent" htmlFor={`${baseId}-consent`}>
          <input
            id={`${baseId}-consent`}
            name={`${baseId}-consent`}
            type="checkbox"
            checked={form.consent}
            onChange={(event) => updateField('consent', event.target.checked)}
            required
          />
          <span>Согласен на обработку контактных данных для обратной связи по заявке.</span>
        </label>

        <div className="form-actions">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={status === 'loading'}
            data-metrika-event="franchise_cta_click"
            data-metrika-source={source}
            data-metrika-label={submitLabel}
          >
            {status === 'loading' ? 'Отправка...' : submitLabel}
          </button>
          {showSecondaryAction ? (
            <a
              className="btn btn-ghost"
              href="#franchise-final-form"
              data-metrika-event="franchise_cta_click"
              data-metrika-source={`${source}_secondary`}
              data-metrika-label="Перейти к полной заявке"
            >
              Перейти к полной заявке
            </a>
          ) : null}
        </div>

        <p className={`form-note ${status === 'error' ? 'error' : ''}`} aria-live="polite">
          {message}
        </p>
      </form>

      {isSuccessPopupOpen ? (
        <div className="submit-success-popup" role="dialog" aria-modal="true" aria-labelledby={`${baseId}-success-title`}>
          <button
            className="submit-success-popup-backdrop"
            type="button"
            onClick={closeSuccessPopup}
            aria-label="Закрыть уведомление"
          />
          <div className="submit-success-popup-card">
            <h3 id={`${baseId}-success-title`}>Заявка отправлена</h3>
            <p>Спасибо. Команда RUNA свяжется с вами для обсуждения города, формата клуба и расчета модели.</p>
            <button className="btn btn-primary" type="button" onClick={closeSuccessPopup}>
              Понятно
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
