import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Невалидный JSON.' }, { status: 400 });
  }

  const auth = await verifyAdminCredentials({
    login: getText(payload?.login),
    password: getText(payload?.password),
  });

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  return NextResponse.json({ ok: true, user: auth.user });
}
