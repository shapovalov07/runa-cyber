import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import {
  addNewsItem,
  getNewsList,
  isManagedNewsUpload,
  removeManagedNewsUpload,
  saveNewsUpload,
} from '@/lib/cms-storage';
import { getAdminCredentialsFromRequest, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';
const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export async function GET() {
  const news = await getNewsList();
  return NextResponse.json({ ok: true, news });
}

export async function POST(request) {
  const contentType = request.headers.get('content-type') ?? '';
  const isFormRequest = contentType.includes('multipart/form-data');

  let payload;
  let uploadedImageSrc = '';

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

    payload = {
      title: getText(formData.get('title')),
      summary: getText(formData.get('summary')),
      content: getText(formData.get('content')),
      imageSrc: getText(formData.get('imageSrc')),
      imageAlt: getText(formData.get('imageAlt')),
      sourceUrl: getText(formData.get('sourceUrl')),
      publishedAt: getText(formData.get('publishedAt')),
    };

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

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: 'Невалидный JSON.' }, { status: 400 });
    }
  }

  try {
    const item = await addNewsItem(payload);
    revalidatePath('/');
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    if (uploadedImageSrc && isManagedNewsUpload(uploadedImageSrc)) {
      await removeManagedNewsUpload(uploadedImageSrc);
    }
    return NextResponse.json({ ok: false, error: error.message || 'Ошибка создания новости.' }, { status: 400 });
  }
}
