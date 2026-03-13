import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export async function POST(request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      { ok: false, error: 'Сервер не настроен: добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID.' },
      { status: 500 }
    );
  }

  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Невалидный JSON в заявке.' }, { status: 400 });
  }

  const name = getText(payload?.name);
  const city = getText(payload?.city);
  const phone = getText(payload?.phone);
  const budget = getText(payload?.budget);
  const comment = getText(payload?.comment);
  const consent = Boolean(payload?.consent);

  if (!name || !city || !phone) {
    return NextResponse.json(
      { ok: false, error: 'Заполните обязательные поля: Имя, Город, Телефон.' },
      { status: 400 }
    );
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 11 || !digits.startsWith('7')) {
    return NextResponse.json({ ok: false, error: 'Проверьте телефон: формат +7 (999) 999-99-99.' }, { status: 400 });
  }

  if (!consent) {
    return NextResponse.json({ ok: false, error: 'Не подтверждено согласие на обработку данных.' }, { status: 400 });
  }

  const messageText = [
    '🟡 Новая заявка на франшизу RUNA',
    `Имя: ${name}`,
    `Город: ${city}`,
    `Телефон: ${phone}`,
    `Бюджет: ${budget || 'не указан'}`,
    `Комментарий: ${comment || 'нет'}`,
    `Страница: ${request.headers.get('origin') || 'неизвестно'}`,
    `Время: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
  ].join('\n');

  const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: messageText,
      disable_web_page_preview: true,
    }),
  });

  let telegramBody = null;

  try {
    telegramBody = await telegramResponse.json();
  } catch {
    telegramBody = null;
  }

  if (!telegramResponse.ok || !telegramBody?.ok) {
    return NextResponse.json(
      { ok: false, error: 'Ошибка отправки в Telegram. Проверьте токен бота и chat_id.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
