import nodemailer from 'nodemailer';

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

export const FRANCHISE_INTEGRATION_KEYS = ['telegram', 'email', 'bitrix'];

export const createIntegrationResult = (status, extra = {}) => ({
  status,
  sentAt: status === 'sent' ? new Date().toISOString() : '',
  attemptedAt: new Date().toISOString(),
  error: getText(extra.error),
  externalId: getText(extra.externalId),
});

export const formatLeadMessage = (lead) =>
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
    `UTM: ${lead.utmSource || '-'} / ${lead.utmMedium || '-'} / ${lead.utmCampaign || '-'} / ${lead.utmContent || '-'} / ${
      lead.utmTerm || '-'
    }`,
    `Referrer: ${lead.referrer || 'не указан'}`,
    `Время: ${new Date(lead.createdAt).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
  ].join('\n');

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
      subject: `Новая заявка на франшизу RUNA - ${lead.city || 'без города'}`,
      text: formatLeadMessage(lead),
    });

    return createIntegrationResult('sent');
  } catch (error) {
    return createIntegrationResult('failed', {
      error: getText(error?.message) || 'Email integration error',
    });
  }
};

const buildBitrixPayload = (lead) => {
  const sourceId = getText(process.env.BITRIX24_SOURCE_ID);
  const assignedById = getText(process.env.BITRIX24_ASSIGNED_BY_ID);
  const categoryId = getText(process.env.BITRIX24_CATEGORY_ID);
  const statusId = getText(process.env.BITRIX24_STATUS_ID);
  const comments = formatLeadMessage(lead);

  return {
    fields: {
      TITLE: `Франшиза RUNA: ${lead.name} (${lead.city})`,
      NAME: lead.name,
      PHONE: [{ VALUE: lead.phone, VALUE_TYPE: 'WORK' }],
      EMAIL: lead.email ? [{ VALUE: lead.email, VALUE_TYPE: 'WORK' }] : [],
      CITY: lead.city,
      COMMENTS: comments,
      SOURCE_ID: sourceId || undefined,
      SOURCE_DESCRIPTION: lead.source || undefined,
      ASSIGNED_BY_ID: assignedById ? Number.parseInt(assignedById, 10) : undefined,
      CATEGORY_ID: categoryId ? Number.parseInt(categoryId, 10) : undefined,
      STATUS_ID: statusId || undefined,
      UTM_SOURCE: lead.utmSource || undefined,
      UTM_MEDIUM: lead.utmMedium || undefined,
      UTM_CAMPAIGN: lead.utmCampaign || undefined,
      UTM_CONTENT: lead.utmContent || undefined,
      UTM_TERM: lead.utmTerm || undefined,
      UF_CRM_RUNA_SOURCE: lead.source || undefined,
      UF_CRM_RUNA_TELEGRAM: lead.telegramUsername || undefined,
      UF_CRM_RUNA_PAGE_URL: lead.pageUrl || undefined,
      UF_CRM_RUNA_REFERRER: lead.referrer || undefined,
    },
  };
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
      body: JSON.stringify(buildBitrixPayload(lead)),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || payload?.error) {
      return createIntegrationResult('failed', {
        error: getText(payload?.error_description) || getText(payload?.error) || `Bitrix responded with status ${response.status}.`,
      });
    }

    return createIntegrationResult('sent', {
      externalId: String(payload?.result ?? ''),
    });
  } catch (error) {
    return createIntegrationResult('failed', {
      error: getText(error?.message) || 'Bitrix integration error',
    });
  }
};

const sendIntegrationByKey = async (lead, key) => {
  if (key === 'telegram') return sendTelegramLeadNotification(lead);
  if (key === 'email') return sendEmailLeadNotification(lead);
  if (key === 'bitrix') return sendBitrixLeadNotification(lead);
  return createIntegrationResult('skipped', { error: `Unknown integration key: ${key}` });
};

export async function deliverFranchiseLead(lead, options = {}) {
  const requestedKeys = Array.isArray(options?.keys) && options.keys.length > 0 ? options.keys : FRANCHISE_INTEGRATION_KEYS;
  const keys = FRANCHISE_INTEGRATION_KEYS.filter((key) => requestedKeys.includes(key));

  const pairs = await Promise.all(
    keys.map(async (key) => {
      const result = await sendIntegrationByKey(lead, key);
      return [key, result];
    })
  );

  return Object.fromEntries(pairs);
}
