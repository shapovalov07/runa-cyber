import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  deleteGalleryPhoto,
  isManagedGalleryUpload,
  removeManagedGalleryUpload,
} from '@/lib/cms-storage';
import { getAdminCredentialsFromRequest, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const auth = await verifyAdminCredentials(getAdminCredentialsFromRequest(request));

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const routeParams = await params;
  const removed = await deleteGalleryPhoto(routeParams?.id);

  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Фото не найдено.' }, { status: 404 });
  }

  if (isManagedGalleryUpload(removed.src)) {
    await removeManagedGalleryUpload(removed.src);
  }

  revalidatePath('/');
  revalidatePath('/clubs');

  return NextResponse.json({ ok: true, removed });
}
