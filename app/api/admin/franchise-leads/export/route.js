import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getAdminCredentialsFromRequest } from '../../../../../lib/admin-auth';
import { createFranchiseLeadExport } from '../../../../../lib/franchise-leads';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const buildRows = (leads) =>
  leads.map((lead) => ({
    ID: getText(lead.id),
    'Дата заявки': getText(lead.createdAt),
    'Имя': getText(lead.name),
    'Телефон': getText(lead.phone),
    'Email': getText(lead.email),
    'Город': getText(lead.city),
    'Telegram': getText(lead.telegramUsername),
    'Формат клуба': getText(lead.format),
    'Бюджет': getText(lead.budget),
    'Комментарий': getText(lead.comment),
    'Источник формы': getText(lead.source),
    'URL страницы': getText(lead.pageUrl),
    'Referrer': getText(lead.referrer),
    'UTM Source': getText(lead.utmSource),
    'UTM Medium': getText(lead.utmMedium),
    'UTM Campaign': getText(lead.utmCampaign),
    'UTM Content': getText(lead.utmContent),
    'UTM Term': getText(lead.utmTerm),
    'Статус менеджера': getText(lead.managerStatus),
    'Заметка менеджера': getText(lead.managerNote),
    'Telegram статус': getText(lead.integrations?.telegram?.status),
    'Telegram ошибка': getText(lead.integrations?.telegram?.error),
    'Email статус': getText(lead.integrations?.email?.status),
    'Email ошибка': getText(lead.integrations?.email?.error),
    'Bitrix статус': getText(lead.integrations?.bitrix?.status),
    'Bitrix ошибка': getText(lead.integrations?.bitrix?.error),
    'User Agent': getText(lead.userAgent),
  }));

export async function GET(request) {
  const result = await createFranchiseLeadExport({
    auth: getAdminCredentialsFromRequest(request),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  const format = getText(request.nextUrl.searchParams.get('format')).toLowerCase() === 'csv' ? 'csv' : 'xlsx';
  const rows = buildRows(result.leads);
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Franchise Leads');

  const buffer =
    format === 'csv'
      ? Buffer.from(XLSX.utils.sheet_to_csv(worksheet), 'utf-8')
      : XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type':
        format === 'csv'
          ? 'text/csv; charset=utf-8'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="runa-franchise-leads.${format}"`,
      'Cache-Control': 'no-store',
    },
  });
}
