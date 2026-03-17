import { NextResponse } from 'next/server';
import { updateAdminProfile } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export async function PATCH(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Невалидный JSON.' }, { status: 400 });
  }

  const result = await updateAdminProfile({
    login: getText(payload?.login),
    password: getText(payload?.password),
    firstName: getText(payload?.firstName),
    lastName: getText(payload?.lastName),
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, user: result.user });
}
