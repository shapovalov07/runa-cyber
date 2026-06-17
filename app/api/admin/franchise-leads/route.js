import { NextResponse } from 'next/server';
import { getAdminCredentialsFromRequest } from '../../../../lib/admin-auth';
import { getFranchiseLeads } from '../../../../lib/franchise-leads';

export const runtime = 'nodejs';

export async function GET(request) {
  const result = await getFranchiseLeads({
    auth: getAdminCredentialsFromRequest(request),
    limit: request.nextUrl.searchParams.get('limit'),
    source: request.nextUrl.searchParams.get('source'),
    managerStatus: request.nextUrl.searchParams.get('managerStatus'),
    integration: request.nextUrl.searchParams.get('integration'),
    deliveryStatus: request.nextUrl.searchParams.get('deliveryStatus'),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, leads: result.leads });
}
