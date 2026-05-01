import { NextResponse } from 'next/server';
import { appendAdminHistory, getAdminCredentialsFromRequest, verifyAdminCredentials } from '../../../../../../lib/admin-auth';
import { deliverFranchiseLead, FRANCHISE_INTEGRATION_KEYS } from '../../../../../../lib/franchise-integrations';
import { getFranchiseLeadById, updateFranchiseLeadIntegrations } from '../../../../../../lib/franchise-leads';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export async function POST(request, { params }) {
  let payload = {};

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const authInput = getAdminCredentialsFromRequest(request);
  const auth = await verifyAdminCredentials(authInput);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const resolvedParams = await params;
  const leadId = getText(resolvedParams?.id);

  if (!leadId) {
    return NextResponse.json({ ok: false, error: 'Не указан идентификатор заявки.' }, { status: 400 });
  }

  const requestedKeys = Array.isArray(payload?.services)
    ? payload.services.map((item) => getText(item).toLowerCase()).filter((item) => FRANCHISE_INTEGRATION_KEYS.includes(item))
    : [];

  const lead = await getFranchiseLeadById(leadId);
  if (!lead) {
    return NextResponse.json({ ok: false, error: 'Заявка не найдена.' }, { status: 404 });
  }

  const deliveries = await deliverFranchiseLead(lead, {
    keys: requestedKeys.length > 0 ? requestedKeys : FRANCHISE_INTEGRATION_KEYS,
  });

  const updatedLead = await updateFranchiseLeadIntegrations(leadId, deliveries);
  if (!updatedLead) {
    return NextResponse.json({ ok: false, error: 'Не удалось обновить статусы интеграций.' }, { status: 500 });
  }

  await appendAdminHistory({
    actor: auth.user,
    action: 'franchise-lead.update',
    targetType: 'franchise-lead',
    targetId: leadId,
    summary: `Повторно отправлены интеграции заявки ${lead.name || lead.phone}: ${Object.keys(deliveries).join(', ')}.`,
  });

  return NextResponse.json({
    ok: true,
    lead: updatedLead,
    integrations: deliveries,
  });
}
