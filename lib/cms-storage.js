import { promises as fs } from 'node:fs';
import path from 'node:path';

const CMS_DIR = path.join(process.cwd(), 'data', 'cms');
const NEWS_FILE = path.join(CMS_DIR, 'news.json');
const GALLERY_FILE = path.join(CMS_DIR, 'gallery.json');
const TOURNAMENT_EVENTS_FILE = path.join(CMS_DIR, 'tournament-events.json');
const NEWS_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'news');
const GALLERY_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'gallery');
const TOURNAMENT_EVENTS_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'tournament-events');
const GALLERY_SECTIONS = ['home', 'clubs', 'tournaments'];
const GALLERY_SECTION_SET = new Set(GALLERY_SECTIONS);
const DEFAULT_GALLERY_SECTION = 'home';

const DEFAULT_NEWS = [
  {
    id: 'news-opening',
    title: 'Открыт набор на любительские турниры',
    summary:
      'Команда RUNA обновила календарь турниров и открыла регистрацию на ближайшие игровые недели.',
    content:
      'Следите за расписанием турниров и обновлениями по дисциплинам в официальном сообществе клуба.',
    imageSrc: '/images/fc26-news.jpg',
    imageAlt: 'Анонс турниров RUNA Cyber Club',
    sourceUrl: 'https://vk.com/runarostov',
    publishedAt: '2026-03-12T09:00:00.000Z',
    createdAt: '2026-03-12T09:00:00.000Z',
  },
];

const DEFAULT_GALLERY = [
  {
    id: 'gallery-home-lounge',
    src: '/images/lounge.jpg',
    alt: 'Неоновая зона клуба',
    section: 'home',
    createdAt: '2026-03-01T08:00:00.000Z',
  },
  {
    id: 'gallery-home-runa-sign',
    src: '/images/runa-sign.jpg',
    alt: 'Входная вывеска RUNA Cyber Club',
    section: 'home',
    createdAt: '2026-03-01T08:05:00.000Z',
  },
  {
    id: 'gallery-home-people',
    src: '/images/club-people.jpg',
    alt: 'Игровая атмосфера RUNA',
    section: 'home',
    createdAt: '2026-03-01T08:10:00.000Z',
  },
  {
    id: 'gallery-clubs-art',
    src: '/images/decor-art.jpg',
    alt: 'Арт-элементы в интерьере RUNA',
    section: 'clubs',
    createdAt: '2026-03-01T08:15:00.000Z',
  },
  {
    id: 'gallery-clubs-bear',
    src: '/images/decor-bear.jpg',
    alt: 'Декор в зоне бара и отдыха',
    section: 'clubs',
    createdAt: '2026-03-01T08:20:00.000Z',
  },
  {
    id: 'gallery-tournaments-fc26',
    src: '/images/fc26-cup.jpg',
    alt: 'Турнир FC 26 в RUNA',
    section: 'tournaments',
    createdAt: '2026-03-01T08:25:00.000Z',
  },
  {
    id: 'gallery-tournaments-promo',
    src: '/images/promo.jpg',
    alt: 'Промо активности RUNA',
    section: 'tournaments',
    createdAt: '2026-03-01T08:30:00.000Z',
  },
  {
    id: 'gallery-tournaments-price',
    src: '/images/price.jpg',
    alt: 'Прайс и бонусы RUNA',
    section: 'tournaments',
    createdAt: '2026-03-01T08:35:00.000Z',
  },
];

const DEFAULT_TOURNAMENT_EVENTS = [
  {
    id: 'event-fc26-weekly',
    title: 'FC 26 WEEKLY',
    summary: 'Открытые мини-турниры каждую неделю для игроков любого уровня.',
    imageSrc: '/images/fc26-cup.jpg',
    imageAlt: 'Турнир FC 26 в RUNA',
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'event-night-squad',
    title: 'Командная ночь',
    summary: 'Ночной формат для squad-составов с отдельными условиями по брони.',
    imageSrc: '/images/promo.jpg',
    imageAlt: 'Командная активность в RUNA',
    createdAt: '2026-03-01T09:05:00.000Z',
  },
  {
    id: 'event-club-cup',
    title: 'Клубный кубок',
    summary: 'Периодический офлайн-ивент с призами и бонусами от клуба.',
    imageSrc: '/images/price.jpg',
    imageAlt: 'Клубный кубок RUNA',
    createdAt: '2026-03-01T09:10:00.000Z',
  },
];

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const toIsoDate = (value, fallback = new Date().toISOString()) => {
  const parsed = typeof value === 'string' ? new Date(value) : new Date(value ?? fallback);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
};

const readJsonArray = async (filePath, fallback) => {
  await ensureDir(path.dirname(filePath));

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // Keep fallback below.
  }

  await fs.writeFile(filePath, `${JSON.stringify(fallback, null, 2)}\n`, 'utf-8');
  return fallback;
};

const writeJsonArray = async (filePath, data) => {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
};

const getText = (value) => (typeof value === 'string' ? value.trim() : '');
const normalizeGallerySection = (value, fallback = DEFAULT_GALLERY_SECTION) => {
  const section = getText(value).toLowerCase();
  if (GALLERY_SECTION_SET.has(section)) return section;
  return fallback;
};
const parseGallerySection = (value) => {
  const section = getText(value).toLowerCase();
  return GALLERY_SECTION_SET.has(section) ? section : '';
};
const hasOwn = (value, key) => Boolean(value) && Object.prototype.hasOwnProperty.call(value, key);

const normalizeNewsItem = (item) => ({
  id: getText(item?.id) || crypto.randomUUID(),
  title: getText(item?.title),
  summary: getText(item?.summary),
  content: getText(item?.content),
  imageSrc: getText(item?.imageSrc),
  imageAlt: getText(item?.imageAlt) || 'Новость RUNA',
  sourceUrl: getText(item?.sourceUrl),
  publishedAt: toIsoDate(item?.publishedAt),
  createdAt: toIsoDate(item?.createdAt),
});

const normalizeGalleryItem = (item) => ({
  id: getText(item?.id) || crypto.randomUUID(),
  src: getText(item?.src),
  alt: getText(item?.alt) || 'Фото клуба RUNA',
  section: normalizeGallerySection(item?.section),
  createdAt: toIsoDate(item?.createdAt),
});

const normalizeTournamentEventItem = (item) => ({
  id: getText(item?.id) || crypto.randomUUID(),
  title: getText(item?.title),
  summary: getText(item?.summary),
  imageSrc: getText(item?.imageSrc),
  imageAlt: getText(item?.imageAlt) || 'Мероприятие RUNA',
  createdAt: toIsoDate(item?.createdAt),
});

export { GALLERY_SECTIONS };

export function isGallerySection(value) {
  return Boolean(parseGallerySection(value));
}

export async function getNewsList() {
  const list = await readJsonArray(NEWS_FILE, DEFAULT_NEWS);
  return list
    .map(normalizeNewsItem)
    .filter((item) => item.title && item.summary)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export async function getNewsItemById(id) {
  const itemId = getText(id);
  if (!itemId) return null;
  const list = await getNewsList();
  return list.find((item) => item.id === itemId) ?? null;
}

export async function addNewsItem(payload) {
  const title = getText(payload?.title);
  const summary = getText(payload?.summary);

  if (!title || !summary) {
    throw new Error('Заполните обязательные поля новости: заголовок и краткое описание.');
  }

  const list = await getNewsList();
  const now = new Date().toISOString();

  const item = normalizeNewsItem({
    id: crypto.randomUUID(),
    title,
    summary,
    content: getText(payload?.content),
    imageSrc: getText(payload?.imageSrc),
    imageAlt: getText(payload?.imageAlt),
    sourceUrl: getText(payload?.sourceUrl),
    publishedAt: getText(payload?.publishedAt) || now,
    createdAt: now,
  });

  const nextList = [item, ...list];
  await writeJsonArray(NEWS_FILE, nextList);
  return item;
}

export async function updateNewsItem(id, payload) {
  const itemId = getText(id);
  if (!itemId) return null;

  const list = await getNewsList();
  const index = list.findIndex((item) => item.id === itemId);

  if (index === -1) {
    return null;
  }

  const current = list[index];
  const nextTitle = hasOwn(payload, 'title') ? getText(payload?.title) : current.title;
  const nextSummary = hasOwn(payload, 'summary') ? getText(payload?.summary) : current.summary;

  if (!nextTitle || !nextSummary) {
    throw new Error('Заполните обязательные поля новости: заголовок и краткое описание.');
  }

  const nextItem = normalizeNewsItem({
    ...current,
    title: nextTitle,
    summary: nextSummary,
    content: hasOwn(payload, 'content') ? getText(payload?.content) : current.content,
    imageSrc: hasOwn(payload, 'imageSrc') ? getText(payload?.imageSrc) : current.imageSrc,
    imageAlt: hasOwn(payload, 'imageAlt') ? getText(payload?.imageAlt) : current.imageAlt,
    sourceUrl: hasOwn(payload, 'sourceUrl') ? getText(payload?.sourceUrl) : current.sourceUrl,
    publishedAt:
      hasOwn(payload, 'publishedAt') && getText(payload?.publishedAt)
        ? getText(payload?.publishedAt)
        : current.publishedAt,
    createdAt: current.createdAt,
  });

  const nextList = [...list];
  nextList[index] = nextItem;
  nextList.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  await writeJsonArray(NEWS_FILE, nextList);

  return {
    previous: current,
    item: nextItem,
  };
}

export async function deleteNewsItem(id) {
  const itemId = getText(id);
  if (!itemId) return null;

  const list = await getNewsList();
  const target = list.find((item) => item.id === itemId) ?? null;
  const nextList = list.filter((item) => item.id !== itemId);

  if (nextList.length === list.length) {
    return null;
  }

  await writeJsonArray(NEWS_FILE, nextList);
  return target;
}

export async function getGalleryPhotos(section) {
  const list = await readJsonArray(GALLERY_FILE, DEFAULT_GALLERY);
  const selectedSection = parseGallerySection(section);
  const hasSectionFilter = Boolean(getText(section));

  const normalized = list
    .map(normalizeGalleryItem)
    .filter((item) => item.src)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!hasSectionFilter) return normalized;
  if (!selectedSection) return [];

  return normalized.filter((item) => item.section === selectedSection);
}

export async function getTournamentEvents() {
  const list = await readJsonArray(TOURNAMENT_EVENTS_FILE, DEFAULT_TOURNAMENT_EVENTS);
  return list
    .map(normalizeTournamentEventItem)
    .filter((item) => item.title && item.summary && item.imageSrc)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addTournamentEvent(payload) {
  const title = getText(payload?.title);
  const summary = getText(payload?.summary);
  const imageSrc = getText(payload?.imageSrc);

  if (!title || !summary || !imageSrc) {
    throw new Error('Заполните обязательные поля: название, краткое описание и изображение.');
  }

  const list = await getTournamentEvents();
  const now = new Date().toISOString();

  const item = normalizeTournamentEventItem({
    id: crypto.randomUUID(),
    title,
    summary,
    imageSrc,
    imageAlt: getText(payload?.imageAlt),
    createdAt: now,
  });

  const nextList = [item, ...list];
  await writeJsonArray(TOURNAMENT_EVENTS_FILE, nextList);
  return item;
}

export async function deleteTournamentEvent(id) {
  const eventId = getText(id);
  if (!eventId) return null;

  const list = await getTournamentEvents();
  const target = list.find((item) => item.id === eventId) ?? null;
  const nextList = list.filter((item) => item.id !== eventId);

  if (nextList.length === list.length) {
    return null;
  }

  await writeJsonArray(TOURNAMENT_EVENTS_FILE, nextList);
  return target;
}

export async function addGalleryPhoto(payload) {
  const src = getText(payload?.src);
  const section = parseGallerySection(payload?.section);

  if (!src) {
    throw new Error('Не найден путь к изображению.');
  }
  if (!section) {
    throw new Error('Выберите раздел, в который нужно добавить фото.');
  }

  const list = await getGalleryPhotos();
  const now = new Date().toISOString();

  const item = normalizeGalleryItem({
    id: crypto.randomUUID(),
    src,
    alt: getText(payload?.alt),
    section,
    createdAt: now,
  });

  const nextList = [item, ...list];
  await writeJsonArray(GALLERY_FILE, nextList);
  return item;
}

export async function deleteGalleryPhoto(id) {
  const itemId = getText(id);
  if (!itemId) return null;

  const list = await getGalleryPhotos();
  const target = list.find((item) => item.id === itemId) ?? null;
  const nextList = list.filter((item) => item.id !== itemId);

  if (nextList.length === list.length) {
    return null;
  }

  await writeJsonArray(GALLERY_FILE, nextList);
  return target;
}

export function isManagedGalleryUpload(src) {
  return getText(src).startsWith('/uploads/gallery/');
}

const getUploadExt = (file, safeName) => {
  const extFromName = safeName.includes('.') ? safeName.split('.').pop() : '';
  if (extFromName) return extFromName;

  if (file?.type === 'image/png') return 'png';
  if (file?.type === 'image/webp') return 'webp';
  if (file?.type === 'image/gif') return 'gif';
  return 'jpg';
};

const saveManagedUpload = async (file, uploadDir, prefix) => {
  const name = getText(file?.name) || 'photo';
  const safeName = name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const ext = getUploadExt(file, safeName);
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  await ensureDir(uploadDir);
  const bytes = Buffer.from(await file.arrayBuffer());
  const destination = path.join(uploadDir, fileName);
  await fs.writeFile(destination, bytes);

  return `${prefix}/${fileName}`;
};

const removeManagedUpload = async (src) => {
  const relativePath = getText(src).replace(/^\//, '');
  const fullPath = path.join(process.cwd(), 'public', relativePath);

  try {
    await fs.unlink(fullPath);
  } catch {
    // Ignore if already deleted.
  }
};

export async function saveNewsUpload(file) {
  return saveManagedUpload(file, NEWS_UPLOAD_DIR, '/uploads/news');
}

export function isManagedNewsUpload(src) {
  return getText(src).startsWith('/uploads/news/');
}

export async function removeManagedNewsUpload(src) {
  if (!isManagedNewsUpload(src)) return;
  await removeManagedUpload(src);
}

export async function saveGalleryUpload(file) {
  return saveManagedUpload(file, GALLERY_UPLOAD_DIR, '/uploads/gallery');
}

export async function removeManagedGalleryUpload(src) {
  if (!isManagedGalleryUpload(src)) return;
  await removeManagedUpload(src);
}

export function isManagedTournamentEventUpload(src) {
  return getText(src).startsWith('/uploads/tournament-events/');
}

export async function saveTournamentEventUpload(file) {
  return saveManagedUpload(file, TOURNAMENT_EVENTS_UPLOAD_DIR, '/uploads/tournament-events');
}

export async function removeManagedTournamentEventUpload(src) {
  if (!isManagedTournamentEventUpload(src)) return;
  await removeManagedUpload(src);
}
