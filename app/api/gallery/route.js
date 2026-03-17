import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { GALLERY_SECTIONS, addGalleryPhoto, getGalleryPhotos, isGallerySection, saveGalleryUpload } from '@/lib/cms-storage';
import { appendAdminHistory, verifyAdminCredentials } from '@/lib/admin-auth';

export const runtime = 'nodejs';

const MAX_UPLOAD_SIZE_BYTES = 8 * 1024 * 1024;
const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const normalizeSection = (value) => getText(value).toLowerCase();

export async function GET(request) {
  const section = normalizeSection(request.nextUrl.searchParams.get('section'));

  if (section && !isGallerySection(section)) {
    return NextResponse.json(
      { ok: false, error: 'Неверный раздел галереи.', availableSections: GALLERY_SECTIONS },
      { status: 400 }
    );
  }

  const photos = await getGalleryPhotos(section || undefined);
  return NextResponse.json({ ok: true, photos, section: section || null, availableSections: GALLERY_SECTIONS });
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
  const section = normalizeSection(formData.get('section'));
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
  if (!section || !isGallerySection(section)) {
    return NextResponse.json({ ok: false, error: 'Выберите раздел галереи.' }, { status: 400 });
  }

  try {
    const item = await addGalleryPhoto({ src, alt, section });
    await appendAdminHistory({
      actor: auth.user,
      action: 'gallery.create',
      targetType: 'gallery-photo',
      targetId: item.id,
      summary: `Добавлено фото в раздел ${item.section}.`,
    });
    revalidatePath('/');
    revalidatePath('/clubs');
    revalidatePath('/tournaments');
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || 'Ошибка добавления фото.' }, { status: 400 });
  }
}
