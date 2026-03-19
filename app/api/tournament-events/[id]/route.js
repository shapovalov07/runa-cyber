import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  deleteTournamentEvent,
  isManagedTournamentEventUpload,
  removeManagedTournamentEventUpload,
  saveTournamentEventUpload,
  updateTournamentEvent,
} from '@/lib/cms-storage';
import { appendAdminHistory, getAdminCredentialsFromRequest, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';
const MAX_UPLOAD_SIZE_BYTES = 40 * 1024 * 1024;
const getText = (value) => (typeof value === 'string' ? value.trim() : '');
const hasOwn = (value, key) => Boolean(value) && Object.prototype.hasOwnProperty.call(value, key);
const isTournamentMediaType = (type) => type.startsWith('image/') || type.startsWith('video/');

export async function PATCH(request, { params }) {
  const routeParams = await params;
  const eventId = routeParams?.id;
  const contentType = request.headers.get('content-type') ?? '';
  const isFormRequest = contentType.includes('multipart/form-data');

  let payload = {};
  let uploadedImageSrc = '';
  let actor = null;

  if (isFormRequest) {
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ ok: false, error: 'Невалидные данные формы.' }, { status: 400 });
    }

    const auth = await verifyAdminCredentials({
      login: getText(formData.get('login')),
      password: getText(formData.get('password')),
    });
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }
    actor = auth.user;

    if (formData.has('title')) payload.title = getText(formData.get('title'));
    if (formData.has('summary')) payload.summary = getText(formData.get('summary'));
    if (formData.has('content')) payload.content = getText(formData.get('content'));
    if (formData.has('imageSrc')) payload.imageSrc = getText(formData.get('imageSrc'));
    if (formData.has('imageAlt')) payload.imageAlt = getText(formData.get('imageAlt'));

    const file = formData.get('photo');
    if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
      if (!isTournamentMediaType(file.type || '')) {
        return NextResponse.json({ ok: false, error: 'Можно загружать только фото, GIF или видео.' }, { status: 400 });
      }

      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json({ ok: false, error: 'Файл слишком большой. Лимит: 40 МБ.' }, { status: 400 });
      }

      uploadedImageSrc = await saveTournamentEventUpload(file);
      payload.imageSrc = uploadedImageSrc;
    }
  } else {
    const auth = await verifyAdminCredentials(getAdminCredentialsFromRequest(request));
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }
    actor = auth.user;

    let jsonPayload;
    try {
      jsonPayload = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'Невалидный JSON.' }, { status: 400 });
    }

    if (hasOwn(jsonPayload, 'title')) payload.title = getText(jsonPayload.title);
    if (hasOwn(jsonPayload, 'summary')) payload.summary = getText(jsonPayload.summary);
    if (hasOwn(jsonPayload, 'content')) payload.content = getText(jsonPayload.content);
    if (hasOwn(jsonPayload, 'imageSrc')) payload.imageSrc = getText(jsonPayload.imageSrc);
    if (hasOwn(jsonPayload, 'imageAlt')) payload.imageAlt = getText(jsonPayload.imageAlt);
  }

  try {
    const updated = await updateTournamentEvent(eventId, payload);

    if (!updated) {
      if (uploadedImageSrc && isManagedTournamentEventUpload(uploadedImageSrc)) {
        await removeManagedTournamentEventUpload(uploadedImageSrc);
      }
      return NextResponse.json({ ok: false, error: 'Мероприятие не найдено.' }, { status: 404 });
    }

    const previousImageSrc = getText(updated.previous?.imageSrc);
    const nextImageSrc = getText(updated.item?.imageSrc);
    if (isManagedTournamentEventUpload(previousImageSrc) && previousImageSrc !== nextImageSrc) {
      await removeManagedTournamentEventUpload(previousImageSrc);
    }
    await appendAdminHistory({
      actor,
      action: 'tournament-event.update',
      targetType: 'tournament-event',
      targetId: updated.item.id,
      summary: updated.item.title || 'Обновлено мероприятие турниров.',
    });

    revalidatePath('/tournaments');
    revalidatePath(`/tournaments/${updated.item.id}`);
    return NextResponse.json({ ok: true, item: updated.item });
  } catch (error) {
    if (uploadedImageSrc && isManagedTournamentEventUpload(uploadedImageSrc)) {
      await removeManagedTournamentEventUpload(uploadedImageSrc);
    }
    return NextResponse.json({ ok: false, error: error.message || 'Ошибка обновления мероприятия.' }, { status: 400 });
  }
}

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
  revalidatePath(`/tournaments/${routeParams?.id}`);
  return NextResponse.json({ ok: true, removed });
}
