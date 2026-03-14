import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { deleteNewsItem, isManagedNewsUpload, removeManagedNewsUpload } from '@/lib/cms-storage';
import { getAdminCredentialsFromRequest, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const auth = await verifyAdminCredentials(getAdminCredentialsFromRequest(request));

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const routeParams = await params;
  const removed = await deleteNewsItem(routeParams?.id);

  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Новость не найдена.' }, { status: 404 });
  }

  if (isManagedNewsUpload(removed.imageSrc)) {
    await removeManagedNewsUpload(removed.imageSrc);
  }

  revalidatePath('/');
  return NextResponse.json({ ok: true, removed });
}
