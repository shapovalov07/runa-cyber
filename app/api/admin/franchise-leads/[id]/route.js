import { NextResponse } from 'next/server';
import { getAdminCredentialsFromRequest } from '../../../../../lib/admin-auth';
import { updateFranchiseLead } from '../../../../../lib/franchise-leads';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export async function PATCH(request, { params }) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Невалидный JSON.' }, { status: 400 });
  }

  const resolvedParams = await params;
  const result = await updateFranchiseLead({
    auth: getAdminCredentialsFromRequest(request),
    leadId: getText(resolvedParams?.id),
    managerStatus: getText(payload?.managerStatus),
    managerNote: getText(payload?.managerNote),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, lead: result.lead });
}
