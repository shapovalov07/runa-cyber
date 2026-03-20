import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');
const parseChatIds = (raw) =>
  Array.from(
    new Set(
      getText(raw)
        .split(/[,\n;\s]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

export async function POST(request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = parseChatIds(process.env.TELEGRAM_CHAT_ID);

  if (!token || chatIds.length === 0) {
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

  const sendResults = await Promise.all(
    chatIds.map(async (chatId) => {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

      let body = null;

      try {
        body = await response.json();
      } catch {
        body = null;
      }

      return {
        chatId,
        ok: response.ok && Boolean(body?.ok),
        status: response.status,
        description: body?.description || '',
      };
    })
  );

  const failed = sendResults.filter((item) => !item.ok);
  if (failed.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        error: `Ошибка отправки в Telegram для ${failed.length} чатов. Проверьте токен бота и chat_id.`,
        failedChatIds: failed.map((item) => ({
          chatId: item.chatId,
          status: item.status,
          description: item.description || 'Unknown error',
        })),
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    sentTo: sendResults.map((item) => item.chatId),
  });
}
