import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTournamentEventById } from '@/lib/cms-storage';
import ExpandableMedia from '@/components/ExpandableMedia';
import RichTextContent from '@/components/RichTextContent';
import { toRichTextPlainText } from '@/lib/rich-text';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const fallbackTournamentEvents = [
  {
    id: 'fallback-event-fc26-weekly',
    title: 'FC 26 WEEKLY',
    summary: 'Еженедельный формат матчей и мини-турниров для игроков любого уровня.',
    content:
      'Регистрация открыта через VK. Для участия просто оставьте заявку: [написать в VK](https://vk.com/runarostov).',
    imageSrc: '/images/fc26-cup.jpg',
    imageAlt: 'Турнир FC 26 в RUNA',
    createdAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'fallback-event-squad-night',
    title: 'Командные ночи',
    summary: 'Ночные сессии для squad-состава с клубными условиями и поддержкой персонала.',
    content: 'Формат подходит для командных серий и тренировочных вечеров с предварительной бронью.',
    imageSrc: '/images/promo.jpg',
    imageAlt: 'Командная активность RUNA',
    createdAt: '2026-03-01T09:05:00.000Z',
  },
  {
    id: 'fallback-event-club-cup',
    title: 'Клубный кубок',
    summary: 'Офлайн-ивент с призами, активностями и бонусами для постоянных игроков.',
    content: 'Следите за анонсами этапов и составом призов в социальных сетях RUNA.',
    imageSrc: '/images/price.jpg',
    imageAlt: 'Клубный кубок RUNA',
    createdAt: '2026-03-01T09:10:00.000Z',
  },
];

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const getTournamentEventId = (value) => {
  const raw = getText(value);
  if (!raw) return '';

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const getFallbackTournamentEventById = (id) => fallbackTournamentEvents.find((item) => item.id === id) ?? null;

const getTournamentEvent = async (id) => {
  const item = await getTournamentEventById(id);
  if (item) return item;
  return getFallbackTournamentEventById(id);
};

const getTournamentMedia = (item) => {
  const mediaSrc = getText(item?.imageSrc);
  const mediaLabel = getText(item?.imageAlt) || getText(item?.title) || 'Мероприятие RUNA';

  return { mediaSrc: mediaSrc || '/images/promo.jpg', mediaLabel };
};

export async function generateMetadata({ params }) {
  const routeParams = await params;
  const eventId = getTournamentEventId(routeParams?.id);
  const item = await getTournamentEvent(eventId);

  if (!item) {
    return {
      title: 'Мероприятие не найдено',
      description: 'Запрашиваемое мероприятие отсутствует или было удалено.',
    };
  }

  return {
    title: `${item.title || 'Мероприятие'} — Кибертурниры RUNA`,
    description:
      toRichTextPlainText(item.summary) || toRichTextPlainText(item.content) || 'Актуальное мероприятие RUNA Cyber Club',
  };
}

export default async function TournamentEventDetailPage({ params }) {
  const routeParams = await params;
  const eventId = getTournamentEventId(routeParams?.id);
  const item = await getTournamentEvent(eventId);

  if (!item) {
    notFound();
  }

  const createdAt = new Date(item.createdAt);
  const createdAtLabel = Number.isNaN(createdAt.getTime()) ? 'Актуальное мероприятие' : dateFormatter.format(createdAt);
  const { mediaSrc, mediaLabel } = getTournamentMedia(item);
  const heroSummary = toRichTextPlainText(item.summary) || 'Описание мероприятия скоро появится.';

  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-tournaments.jpg')" }}>
        <div className="container">
          <p className="kicker">Кибертурниры RUNA</p>
          <h1>{item.title || 'Мероприятие RUNA'}</h1>
          <p>{heroSummary}</p>
          <div className="hero-actions">
            <Link className="btn btn-outline" href="/tournaments">
              Ко всем мероприятиям
            </Link>
            <a className="btn btn-primary" href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
              Анонсы в VK
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="card news-detail-shell">
            <div className="news-detail-meta">
              <span className="news-date">{createdAtLabel}</span>
              <span className="news-badge">Мероприятие</span>
            </div>
            <div className="news-detail-cover">
              <ExpandableMedia src={mediaSrc} alt={mediaLabel} imageLoading="eager" />
            </div>
            <div className="news-detail-body">
              <RichTextContent
                value={item.summary || 'Описание мероприятия скоро появится.'}
                className="news-detail-summary rich-text rich-text-lg"
              />
              {item.content ? (
                <RichTextContent value={item.content} className="news-detail-content rich-text rich-text-lg" />
              ) : null}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
