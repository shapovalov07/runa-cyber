'use client';

import { useEffect, useRef, useState } from 'react';

const initialState = {
  name: '',
  city: '',
  phone: '',
  budget: '',
  comment: '',
  consent: false,
};

const PHONE_MAX_LENGTH = 18;

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

export default function FranchiseForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
  const phoneInputRef = useRef(null);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false);
  };

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

    if (!form.name.trim() || !form.city.trim() || !form.phone.trim()) {
      setStatus('error');
      setMessage('Заполните обязательные поля: Имя, Город и Телефон.');
      return;
    }

    const digits = form.phone.replace(/\D/g, '');
    if (digits.length !== 11 || !digits.startsWith('7')) {
      setStatus('error');
      setMessage('Введите телефон в формате +7 (999) 999-99-99.');
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
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Не удалось отправить заявку.');
      }

      setStatus('success');
      setMessage('Заявка отправлена в Telegram. Команда свяжется с вами.');
      setForm(initialState);
      setIsSuccessPopupOpen(true);
    } catch (error) {
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
      <form className="franchise-form reveal" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <label className="form-field" htmlFor="name">
            <span>Имя *</span>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ваше имя"
              autoComplete="name"
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              required
            />
          </label>

          <label className="form-field" htmlFor="city">
            <span>Город *</span>
            <input
              id="city"
              name="city"
              type="text"
              placeholder="Ваш город"
              autoComplete="address-level2"
              value={form.city}
              onChange={(event) => updateField('city', event.target.value)}
              required
            />
          </label>

          <label className="form-field" htmlFor="phone">
            <span>Телефон *</span>
            <input
              ref={phoneInputRef}
              id="phone"
              name="phone"
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

          <label className="form-field" htmlFor="budget">
            <span>Ориентировочный бюджет</span>
            <select
              id="budget"
              name="budget"
              value={form.budget}
              onChange={(event) => updateField('budget', event.target.value)}
            >
              <option value="">Выберите диапазон</option>
              <option value="До 3 млн ₽">До 3 млн ₽</option>
              <option value="3-6 млн ₽">3-6 млн ₽</option>
              <option value="6-10 млн ₽">6-10 млн ₽</option>
              <option value="10+ млн ₽">10+ млн ₽</option>
            </select>
          </label>

          <label className="form-field full" htmlFor="comment">
            <span>Комментарий</span>
            <textarea
              id="comment"
              name="comment"
              placeholder="Кратко о локации, сроках, ожиданиях"
              value={form.comment}
              onChange={(event) => updateField('comment', event.target.value)}
            ></textarea>
          </label>
        </div>

        <label className="form-consent" htmlFor="consent">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={form.consent}
            onChange={(event) => updateField('consent', event.target.checked)}
            required
          />
          <span>Согласен на обработку контактных данных для обратной связи по заявке.</span>
        </label>

        <div className="form-actions">
          <button className="btn btn-primary" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Отправка...' : 'Отправить заявку'}
          </button>
          <a className="btn btn-ghost" href="https://vk.com/im?sel=-229523120" target="_blank" rel="noopener noreferrer">
            Написать в VK
          </a>
        </div>

        <p className={`form-note ${status === 'error' ? 'error' : ''}`} aria-live="polite">
          {message}
        </p>
      </form>

      {isSuccessPopupOpen ? (
        <div className="submit-success-popup" role="dialog" aria-modal="true" aria-labelledby="submit-success-title">
          <button
            className="submit-success-popup-backdrop"
            type="button"
            onClick={closeSuccessPopup}
            aria-label="Закрыть уведомление"
          />
          <div className="submit-success-popup-card">
            <h3 id="submit-success-title">Заявка отправлена</h3>
            <p>Спасибо! Мы получили вашу заявку и свяжемся с вами в ближайшее время.</p>
            <button className="btn btn-primary" type="button" onClick={closeSuccessPopup}>
              Понятно
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
