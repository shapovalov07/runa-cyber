import { NextResponse } from 'next/server';
import { deleteAdminUser, getAdminCredentialsFromRequest, resetAdminUserPassword } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const routeParams = await params;

  const result = await deleteAdminUser({
    auth: getAdminCredentialsFromRequest(request),
    targetLogin: routeParams?.login,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, removed: result.removed });
}

export async function PATCH(request, { params }) {
  const routeParams = await params;
  const payload = await request.json().catch(() => ({}));

  const result = await resetAdminUserPassword({
    auth: getAdminCredentialsFromRequest(request),
    targetLogin: routeParams?.login,
    nextPassword: payload?.password,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true, user: result.user });
}
