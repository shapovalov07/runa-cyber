import { NextResponse } from 'next/server';
import { createAdminUser, getAdminCredentialsFromRequest, getAdminUsers } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export async function GET(request) {
  const result = await getAdminUsers({
    auth: getAdminCredentialsFromRequest(request),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, users: result.users });
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Невалидный JSON.' }, { status: 400 });
  }

  const result = await createAdminUser({
    auth: getAdminCredentialsFromRequest(request),
    user: {
      login: getText(payload?.login),
      password: getText(payload?.password),
      firstName: getText(payload?.firstName),
      lastName: getText(payload?.lastName),
      role: getText(payload?.role),
    },
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, user: result.user }, { status: 201 });
}
