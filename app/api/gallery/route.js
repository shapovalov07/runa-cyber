import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { addGalleryPhoto, getGalleryPhotos, saveGalleryUpload } from '@/lib/cms-storage';
import { verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const getText = (value) => (typeof value === 'string' ? value.trim() : '');

export async function GET() {
  const photos = await getGalleryPhotos();
  return NextResponse.json({ ok: true, photos });
}

export async function POST(request) {
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

  const alt = getText(formData.get('alt'));
  const srcFromForm = getText(formData.get('src'));
  const file = formData.get('photo');

  let src = srcFromForm;

  if (file && typeof file === 'object' && typeof file.arrayBuffer === 'function' && file.size > 0) {
    if (!file.type?.startsWith('image/')) {
      return NextResponse.json({ ok: false, error: 'Можно загружать только изображения.' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return NextResponse.json({ ok: false, error: 'Файл слишком большой. Лимит: 8 МБ.' }, { status: 400 });
    }

    src = await saveGalleryUpload(file);
  }

  if (!src) {
    return NextResponse.json({ ok: false, error: 'Добавьте файл или укажите ссылку на изображение.' }, { status: 400 });
  }

  try {
    const item = await addGalleryPhoto({ src, alt });
    revalidatePath('/');
    revalidatePath('/clubs');
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'Ошибка добавления фото.' }, { status: 400 });
  }
}
