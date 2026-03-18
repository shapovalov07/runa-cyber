import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  deleteGalleryPhoto,
  isManagedGalleryUpload,
  removeManagedGalleryUpload,
} from '@/lib/cms-storage';
import { appendAdminHistory, getAdminCredentialsFromRequest, verifyAdminCredentials } from '@/lib/admin-auth';

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
  await appendAdminHistory({
    actor: auth.user,
    action: 'gallery.delete',
    targetType: 'gallery-photo',
    targetId: removed.id,
    summary: `Удалено фото из раздела ${removed.section || 'home'}${
      removed.section === 'clubs' ? ` (город: ${removed.citySlug || 'все'})` : ''
    }.`,
  });

  revalidatePath('/');
  revalidatePath('/clubs');
  revalidatePath('/tournaments');

  return NextResponse.json({ ok: true, removed });
}
