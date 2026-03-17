import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  deleteNewsItem,
  isManagedNewsUpload,
  removeManagedNewsUpload,
  saveNewsUpload,
  updateNewsItem,
} from '@/lib/cms-storage';
import { appendAdminHistory, getAdminCredentialsFromRequest, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';
const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const getText = (value) => (typeof value === 'string' ? value.trim() : '');
const hasOwn = (value, key) => Boolean(value) && Object.prototype.hasOwnProperty.call(value, key);

export async function PATCH(request, { params }) {
  const routeParams = await params;
  const newsId = routeParams?.id;
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
    if (formData.has('sourceUrl')) payload.sourceUrl = getText(formData.get('sourceUrl'));
    if (formData.has('publishedAt')) payload.publishedAt = getText(formData.get('publishedAt'));

    const file = formData.get('photo');
    if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
      if (!file.type?.startsWith('image/')) {
        return NextResponse.json({ ok: false, error: 'Можно загружать только изображения.' }, { status: 400 });
      }

      if (file.size > MAX_UPLOAD_SIZE_BYTES) {
        return NextResponse.json({ ok: false, error: 'Файл слишком большой. Лимит: 8 МБ.' }, { status: 400 });
      }

      uploadedImageSrc = await saveNewsUpload(file);
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
    if (hasOwn(jsonPayload, 'sourceUrl')) payload.sourceUrl = getText(jsonPayload.sourceUrl);
    if (hasOwn(jsonPayload, 'publishedAt')) payload.publishedAt = getText(jsonPayload.publishedAt);
  }

  try {
    const updated = await updateNewsItem(newsId, payload);

    if (!updated) {
      if (uploadedImageSrc && isManagedNewsUpload(uploadedImageSrc)) {
        await removeManagedNewsUpload(uploadedImageSrc);
      }
      return NextResponse.json({ ok: false, error: 'Новость не найдена.' }, { status: 404 });
    }

    if (
      uploadedImageSrc &&
      isManagedNewsUpload(updated.previous?.imageSrc) &&
      updated.previous.imageSrc !== uploadedImageSrc
    ) {
      await removeManagedNewsUpload(updated.previous.imageSrc);
    }
    await appendAdminHistory({
      actor,
      action: 'news.update',
      targetType: 'news',
      targetId: updated.item.id,
      summary: updated.item.title || 'Обновлена новость.',
    });

    revalidatePath('/');
    revalidatePath('/news');
    revalidatePath(`/news/${updated.item.id}`);
    return NextResponse.json({ ok: true, item: updated.item });
  } catch (error) {
    if (uploadedImageSrc && isManagedNewsUpload(uploadedImageSrc)) {
      await removeManagedNewsUpload(uploadedImageSrc);
    }
    return NextResponse.json({ ok: false, error: error.message || 'Ошибка обновления новости.' }, { status: 400 });
  }
}

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
  await appendAdminHistory({
    actor: auth.user,
    action: 'news.delete',
    targetType: 'news',
    targetId: removed.id,
    summary: removed.title || 'Удалена новость.',
  });

  revalidatePath('/');
  revalidatePath('/news');
  revalidatePath(`/news/${routeParams?.id}`);
  return NextResponse.json({ ok: true, removed });
}
