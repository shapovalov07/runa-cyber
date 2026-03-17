import { NextResponse } from 'next/server';
import { getAdminCredentialsFromRequest, getAdminHistory } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function GET(request) {
  const result = await getAdminHistory({
    auth: getAdminCredentialsFromRequest(request),
    limit: request.nextUrl.searchParams.get('limit'),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, history: result.history });
}
