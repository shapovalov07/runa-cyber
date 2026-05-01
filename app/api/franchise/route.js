import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createFranchiseLead, updateFranchiseLeadIntegrations } from '../../../lib/franchise-leads';

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

const extractUtmFromUrl = (value) => {
  const urlValue = getText(value);
  if (!urlValue) {
    return {};
  }

  try {
    const url = new URL(urlValue);
    return {
      utmSource: getText(url.searchParams.get('utm_source')),
      utmMedium: getText(url.searchParams.get('utm_medium')),
      utmCampaign: getText(url.searchParams.get('utm_campaign')),
      utmContent: getText(url.searchParams.get('utm_content')),
      utmTerm: getText(url.searchParams.get('utm_term')),
    };
  } catch {
    return {};
  }
};

const formatLeadMessage = (lead) =>
  [
    '🟡 Новая заявка на франшизу RUNA',
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    `Email: ${lead.email || 'не указан'}`,
    `Город: ${lead.city}`,
    `Telegram: ${lead.telegramUsername || 'не указан'}`,
    `Формат: ${lead.format || 'не указан'}`,
    `Бюджет: ${lead.budget || 'не указан'}`,
    `Комментарий: ${lead.comment || 'нет'}`,
    `Источник: ${lead.source || 'не указан'}`,
    `Страница: ${lead.pageUrl || 'не указана'}`,
    `UTM: ${lead.utmSource || '-'} / ${lead.utmMedium || '-'} / ${lead.utmCampaign || '-'}`,
    `Referrer: ${lead.referrer || 'не указан'}`,
    `Время: ${new Date(lead.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
  ].join('\n');

const createIntegrationResult = (status, extra = {}) => ({
  status,
  sentAt: status === 'sent' ? new Date().toISOString() : '',
  error: getText(extra.error),
});

const sendTelegramLeadNotification = async (lead) => {
  const token = getText(process.env.TELEGRAM_BOT_TOKEN);
  const chatIds = parseChatIds(process.env.TELEGRAM_CHAT_ID);

  if (!token || chatIds.length === 0) {
    return createIntegrationResult('skipped');
  }

  const messageText = formatLeadMessage(lead);
  const results = await Promise.all(
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
        ok: response.ok && Boolean(body?.ok),
        description: getText(body?.description),
        status: response.status,
      };
    })
  );

  const failed = results.filter((item) => !item.ok);
  if (failed.length > 0) {
    return createIntegrationResult('failed', {
      error: failed.map((item) => `${item.status}: ${item.description || 'Telegram error'}`).join('; '),
    });
  }

  return createIntegrationResult('sent');
};

const sendEmailLeadNotification = async (lead) => {
  const host = getText(process.env.SMTP_HOST);
  const port = Number.parseInt(getText(process.env.SMTP_PORT), 10) || 587;
  const secure = getText(process.env.SMTP_SECURE).toLowerCase() === 'true';
  const user = getText(process.env.SMTP_USER);
  const pass = getText(process.env.SMTP_PASSWORD);
  const from = getText(process.env.SMTP_FROM) || user;
  const to = getText(process.env.FRANCHISE_EMAIL_TO);

  if (!host || !user || !pass || !from || !to) {
    return createIntegrationResult('skipped');
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to,
      subject: `Новая заявка RUNA Franchise: ${lead.name} / ${lead.city}`,
      text: formatLeadMessage(lead),
    });

    return createIntegrationResult('sent');
  } catch (error) {
    return createIntegrationResult('failed', {
      error: getText(error?.message) || 'Email integration error',
    });
  }
};

const sendBitrixLeadNotification = async (lead) => {
  const webhookUrl = getText(process.env.BITRIX24_WEBHOOK_URL);

  if (!webhookUrl) {
    return createIntegrationResult('skipped');
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          TITLE: `Франшиза RUNA: ${lead.name} (${lead.city})`,
          NAME: lead.name,
          PHONE: [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }],
          EMAIL: lead.email ? [{ VALUE: lead.email, VALUE_TYPE: 'WORK' }] : [],
          CITY: lead.city,
          COMMENTS: formatLeadMessage(lead),
          UTM_SOURCE: lead.utmSource,
          UTM_MEDIUM: lead.utmMedium,
          UTM_CAMPAIGN: lead.utmCampaign,
          UTM_CONTENT: lead.utmContent,
          UTM_TERM: lead.utmTerm,
        },
      }),
    });

    if (!response.ok) {
      return createIntegrationResult('failed', {
        error: `Bitrix responded with status ${response.status}.`,
      });
    }

    return createIntegrationResult('sent');
  } catch (error) {
    return createIntegrationResult('failed', {
      error: getText(error?.message) || 'Bitrix integration error',
    });
  }
};

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Невалидный JSON в заявке.' }, { status: 400 });
  }

  const pageUrl = getText(payload?.pageUrl || request.headers.get('origin'));
  const utmFromUrl = extractUtmFromUrl(pageUrl);

  let lead;

  try {
    lead = await createFranchiseLead({
      ...payload,
      source: getText(payload?.source) || 'franchise-form',
      pageUrl,
      referrer: getText(payload?.referrer || request.headers.get('referer')),
      userAgent: getText(payload?.userAgent || request.headers.get('user-agent')),
      utmSource: getText(payload?.utmSource) || utmFromUrl.utmSource,
      utmMedium: getText(payload?.utmMedium) || utmFromUrl.utmMedium,
      utmCampaign: getText(payload?.utmCampaign) || utmFromUrl.utmCampaign,
      utmContent: getText(payload?.utmContent) || utmFromUrl.utmContent,
      utmTerm: getText(payload?.utmTerm) || utmFromUrl.utmTerm,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: getText(error?.message) || 'Не удалось сохранить заявку.',
      },
      { status: 400 }
    );
  }

  const [telegram, email, bitrix] = await Promise.all([
    sendTelegramLeadNotification(lead),
    sendEmailLeadNotification(lead),
    sendBitrixLeadNotification(lead),
  ]);

  const updatedLead = await updateFranchiseLeadIntegrations(lead.id, {
    telegram,
    email,
    bitrix,
  });

  const warnings = [telegram, email, bitrix]
    .filter((item) => item.status === 'failed')
    .map((item) => item.error)
    .filter(Boolean);

  return NextResponse.json(
    {
      ok: true,
      leadId: lead.id,
      message: 'Заявка сохранена. Команда RUNA свяжется с вами.',
      warnings,
      integrations: updatedLead?.integrations || { telegram, email, bitrix },
    },
    { status: 201 }
  );
}
