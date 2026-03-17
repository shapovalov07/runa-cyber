import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  deleteTournamentEvent,
  isManagedTournamentEventUpload,
  removeManagedTournamentEventUpload,
} from '@/lib/cms-storage';
import { appendAdminHistory, getAdminCredentialsFromRequest, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function DELETE(request, { params }) {
  const auth = await verifyAdminCredentials(getAdminCredentialsFromRequest(request));

  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
  }

  const routeParams = await params;
  const removed = await deleteTournamentEvent(routeParams?.id);

  if (!removed) {
    return NextResponse.json({ ok: false, error: 'Мероприятие не найдено.' }, { status: 404 });
  }

  if (isManagedTournamentEventUpload(removed.imageSrc)) {
    await removeManagedTournamentEventUpload(removed.imageSrc);
  }
  await appendAdminHistory({
    actor: auth.user,
    action: 'tournament-event.delete',
    targetType: 'tournament-event',
    targetId: removed.id,
    summary: removed.title || 'Удалено мероприятие турниров.',
  });

  revalidatePath('/tournaments');
  return NextResponse.json({ ok: true, removed });
}
