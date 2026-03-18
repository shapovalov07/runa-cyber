import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  addTournamentEvent,
  getTournamentEvents,
  isManagedTournamentEventUpload,
  removeManagedTournamentEventUpload,
  saveTournamentEventUpload,
} from '@/lib/cms-storage';
import { appendAdminHistory, getAdminCredentialsFromRequest, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const MAX_UPLOAD_SIZE_BYTES = 40 * 1024 * 1024;
const getText = (value) => (typeof value === 'string' ? value.trim() : '');
const isTournamentMediaType = (type) => type.startsWith('image/') || type.startsWith('video/');

export async function GET() {
  const items = await getTournamentEvents();
  return NextResponse.json({ ok: true, items });
}

export async function POST(request) {
  const contentType = request.headers.get('content-type') ?? '';
  const isFormRequest = contentType.includes('multipart/form-data');

  let payload;
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

    payload = {
      title: getText(formData.get('title')),
      summary: getText(formData.get('summary')),
      imageSrc: getText(formData.get('imageSrc')),
      imageAlt: getText(formData.get('imageAlt')),
    };

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

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'Невалидный JSON.' }, { status: 400 });
    }
  }

  try {
    const item = await addTournamentEvent(payload);
    await appendAdminHistory({
      actor,
      action: 'tournament-event.create',
      targetType: 'tournament-event',
      targetId: item.id,
      summary: item.title || 'Создано мероприятие турниров.',
    });
    revalidatePath('/tournaments');
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    if (uploadedImageSrc && isManagedTournamentEventUpload(uploadedImageSrc)) {
      await removeManagedTournamentEventUpload(uploadedImageSrc);
    }
    return NextResponse.json({ ok: false, error: error.message || 'Ошибка создания мероприятия.' }, { status: 400 });
  }
}
