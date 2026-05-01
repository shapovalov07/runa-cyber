import { NextResponse } from 'next/server';
import { createFranchiseLead, updateFranchiseLeadIntegrations } from '../../../lib/franchise-leads';
import { deliverFranchiseLead } from '../../../lib/franchise-integrations';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

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

  const deliveries = await deliverFranchiseLead(lead);

  const updatedLead = await updateFranchiseLeadIntegrations(lead.id, {
    telegram: deliveries.telegram,
    email: deliveries.email,
    bitrix: deliveries.bitrix,
  });

  const warnings = [deliveries.telegram, deliveries.email, deliveries.bitrix]
    .filter((item) => item.status === 'failed')
    .map((item) => item.error)
    .filter(Boolean);

  return NextResponse.json(
    {
      ok: true,
      leadId: lead.id,
      message: 'Заявка сохранена. Команда RUNA свяжется с вами.',
      warnings,
      integrations: updatedLead?.integrations || deliveries,
    },
    { status: 201 }
  );
}
