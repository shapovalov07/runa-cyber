import { promises as fs } from 'node:fs';
import path from 'node:path';
import { appendAdminHistory, verifyAdminCredentials } from './admin-auth';

const FRANCHISE_LEADS_FILE = path.join(process.cwd(), 'data', 'cms', 'franchise-leads.json');
const DELIVERY_STATUSES = ['pending', 'sent', 'failed', 'skipped'];
const DELIVERY_STATUS_SET = new Set(DELIVERY_STATUSES);
const MANAGER_STATUSES = ['new', 'contacted', 'qualified', 'meeting', 'offer', 'won', 'lost'];
const MANAGER_STATUS_SET = new Set(MANAGER_STATUSES);

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const toIsoDate = (value, fallback = new Date().toISOString()) => {
  const parsed = typeof value === 'string' ? new Date(value) : new Date(value ?? fallback);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
};

const normalizeDeliveryStatus = (value, fallback = 'pending') => {
  const status = getText(value).toLowerCase();
  return DELIVERY_STATUS_SET.has(status) ? status : fallback;
};

const normalizeManagerStatus = (value, fallback = 'new') => {
  const status = getText(value).toLowerCase();
  return MANAGER_STATUS_SET.has(status) ? status : fallback;
};

const normalizeIntegrationState = (value, fallback = 'pending') => ({
  status: normalizeDeliveryStatus(value?.status, fallback),
  sentAt: getText(value?.sentAt) ? toIsoDate(value.sentAt) : '',
  error: getText(value?.error),
});

const normalizeLead = (value) => {
  const createdAt = toIsoDate(value?.createdAt);
  const updatedAt = toIsoDate(value?.updatedAt || createdAt, createdAt);

  return {
    id: getText(value?.id) || crypto.randomUUID(),
    createdAt,
    updatedAt,
    name: getText(value?.name),
    phone: getText(value?.phone),
    email: getText(value?.email),
    city: getText(value?.city),
    telegramUsername: getText(value?.telegramUsername),
    budget: getText(value?.budget),
    format: getText(value?.format),
    comment: getText(value?.comment),
    consent: Boolean(value?.consent),
    source: getText(value?.source) || 'franchise-form',
    pageUrl: getText(value?.pageUrl),
    referrer: getText(value?.referrer),
    userAgent: getText(value?.userAgent),
    utmSource: getText(value?.utmSource),
    utmMedium: getText(value?.utmMedium),
    utmCampaign: getText(value?.utmCampaign),
    utmContent: getText(value?.utmContent),
    utmTerm: getText(value?.utmTerm),
    managerStatus: normalizeManagerStatus(value?.managerStatus, 'new'),
    managerNote: getText(value?.managerNote),
    integrations: {
      telegram: normalizeIntegrationState(value?.integrations?.telegram, 'pending'),
      email: normalizeIntegrationState(value?.integrations?.email, 'pending'),
      bitrix: normalizeIntegrationState(value?.integrations?.bitrix, 'pending'),
    },
  };
};

const ensureLeadsDir = async () => {
  await fs.mkdir(path.dirname(FRANCHISE_LEADS_FILE), { recursive: true });
};

const readLeadList = async () => {
  await ensureLeadsDir();

  try {
    const raw = await fs.readFile(FRANCHISE_LEADS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      throw new Error('Invalid franchise leads storage format.');
    }

    return parsed.map(normalizeLead);
  } catch {
    await fs.writeFile(FRANCHISE_LEADS_FILE, '[]\n', 'utf-8');
    return [];
  }
};

const writeLeadList = async (list) => {
  await ensureLeadsDir();
  await fs.writeFile(FRANCHISE_LEADS_FILE, `${JSON.stringify(list, null, 2)}\n`, 'utf-8');
};

const validateEmail = (value) => {
  const email = getText(value);
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);
};

const validatePhone = (value) => {
  const digits = getText(value).replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('7');
};

export { DELIVERY_STATUSES, MANAGER_STATUSES };

export async function createFranchiseLead(payload) {
  const name = getText(payload?.name);
  const city = getText(payload?.city);
  const phone = getText(payload?.phone);
  const email = getText(payload?.email);

  if (!name || !city || !phone) {
    throw new Error('Заполните обязательные поля: Имя, Город и Телефон.');
  }

  if (!validatePhone(phone)) {
    throw new Error('Проверьте телефон: формат +7 (999) 999-99-99.');
  }

  if (!validateEmail(email)) {
    throw new Error('Проверьте email.');
  }

  if (!payload?.consent) {
    throw new Error('Не подтверждено согласие на обработку данных.');
  }

  const list = await readLeadList();
  const now = new Date().toISOString();

  const lead = normalizeLead({
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    name,
    phone,
    email,
    city,
    telegramUsername: getText(payload?.telegramUsername),
    budget: getText(payload?.budget),
    format: getText(payload?.format),
    comment: getText(payload?.comment),
    consent: true,
    source: getText(payload?.source) || 'franchise-form',
    pageUrl: getText(payload?.pageUrl),
    referrer: getText(payload?.referrer),
    userAgent: getText(payload?.userAgent),
    utmSource: getText(payload?.utmSource),
    utmMedium: getText(payload?.utmMedium),
    utmCampaign: getText(payload?.utmCampaign),
    utmContent: getText(payload?.utmContent),
    utmTerm: getText(payload?.utmTerm),
    managerStatus: 'new',
    managerNote: '',
    integrations: {
      telegram: { status: 'pending', sentAt: '', error: '' },
      email: { status: 'pending', sentAt: '', error: '' },
      bitrix: { status: 'pending', sentAt: '', error: '' },
    },
  });

  list.unshift(lead);
  await writeLeadList(list);

  return lead;
}

export async function updateFranchiseLeadIntegrations(id, patch) {
  const targetId = getText(id);
  if (!targetId) return null;

  const list = await readLeadList();
  const targetIndex = list.findIndex((item) => item.id === targetId);
  if (targetIndex === -1) return null;

  const currentLead = list[targetIndex];
  const nextLead = normalizeLead({
    ...currentLead,
    updatedAt: new Date().toISOString(),
    integrations: {
      telegram: {
        ...currentLead.integrations.telegram,
        ...(patch?.telegram || {}),
      },
      email: {
        ...currentLead.integrations.email,
        ...(patch?.email || {}),
      },
      bitrix: {
        ...currentLead.integrations.bitrix,
        ...(patch?.bitrix || {}),
      },
    },
  });

  list[targetIndex] = nextLead;
  await writeLeadList(list);
  return nextLead;
}

export async function getFranchiseLeads(input) {
  const auth = await verifyAdminCredentials(input?.auth);

  if (!auth.ok) {
    return auth;
  }

  const limitValue = Number.parseInt(getText(input?.limit), 10);
  const sourceFilter = getText(input?.source).toLowerCase();
  const managerStatusFilter = normalizeManagerStatus(input?.managerStatus, '');
  const integrationFilter = getText(input?.integration).toLowerCase();
  const deliveryStatusFilter = normalizeDeliveryStatus(input?.deliveryStatus, '');

  let leads = await readLeadList();
  leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (sourceFilter) {
    leads = leads.filter((item) => getText(item.source).toLowerCase() === sourceFilter);
  }

  if (managerStatusFilter) {
    leads = leads.filter((item) => item.managerStatus === managerStatusFilter);
  }

  if (integrationFilter && ['telegram', 'email', 'bitrix'].includes(integrationFilter) && deliveryStatusFilter) {
    leads = leads.filter((item) => item.integrations?.[integrationFilter]?.status === deliveryStatusFilter);
  }

  if (Number.isInteger(limitValue) && limitValue > 0) {
    leads = leads.slice(0, limitValue);
  }

  return {
    ok: true,
    leads,
  };
}

export async function updateFranchiseLead(input) {
  const auth = await verifyAdminCredentials(input?.auth);

  if (!auth.ok) {
    return auth;
  }

  const leadId = getText(input?.leadId);
  if (!leadId) {
    return {
      ok: false,
      status: 400,
      error: 'Не указан идентификатор заявки.',
    };
  }

  const list = await readLeadList();
  const targetIndex = list.findIndex((item) => item.id === leadId);

  if (targetIndex === -1) {
    return {
      ok: false,
      status: 404,
      error: 'Заявка не найдена.',
    };
  }

  const currentLead = list[targetIndex];
  const nextManagerStatus = normalizeManagerStatus(input?.managerStatus, currentLead.managerStatus);
  const nextManagerNote = getText(input?.managerNote);

  list[targetIndex] = normalizeLead({
    ...currentLead,
    updatedAt: new Date().toISOString(),
    managerStatus: nextManagerStatus,
    managerNote: nextManagerNote,
  });

  await writeLeadList(list);

  await appendAdminHistory({
    actor: auth.user,
    action: 'franchise-lead.update',
    targetType: 'franchise-lead',
    targetId: leadId,
    summary: `Обновлен статус заявки ${currentLead.name || currentLead.phone}: ${nextManagerStatus}.`,
  });

  return {
    ok: true,
    lead: list[targetIndex],
  };
}

export async function createFranchiseLeadExport(input) {
  const auth = await verifyAdminCredentials(input?.auth);

  if (!auth.ok) {
    return auth;
  }

  const leads = await readLeadList();
  leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  await appendAdminHistory({
    actor: auth.user,
    action: 'franchise-lead.export',
    targetType: 'franchise-lead',
    targetId: 'all',
    summary: `Экспортировано заявок: ${leads.length}.`,
  });

  return {
    ok: true,
    leads,
  };
}
