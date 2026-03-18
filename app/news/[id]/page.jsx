import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getNewsItemById } from '@/lib/cms-storage';
import { isVideoMediaSrc } from '@/lib/media';

export const dynamic = 'force-dynamic';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const getText = (value) => (typeof value === 'string' ? value.trim() : '');

const getNewsId = (value) => {
  const raw = getText(value);
  if (!raw) return '';

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const splitParagraphs = (value) =>
  getText(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const renderNewsMedia = (item) => {
  const mediaSrc = getText(item?.imageSrc) || '/images/fc26-news.jpg';
  const mediaLabel = getText(item?.imageAlt) || getText(item?.title) || 'Новость RUNA';

  if (isVideoMediaSrc(mediaSrc)) {
    return <video src={mediaSrc} aria-label={mediaLabel} controls preload="metadata" playsInline />;
  }

  return <img src={mediaSrc} alt={mediaLabel} />;
};

export async function generateMetadata({ params }) {
  const routeParams = await params;
  const newsId = getNewsId(routeParams?.id);
  const item = await getNewsItemById(newsId);

  if (!item) {
    return {
      title: 'Новость не найдена',
      description: 'Запрашиваемая новость отсутствует или была удалена.',
    };
  }

  return {
    title: `${item.title} — Новости RUNA`,
    description: item.summary || 'Публикация RUNA Cyber Club',
  };
}

export default async function NewsDetailPage({ params }) {
  const routeParams = await params;
  const newsId = getNewsId(routeParams?.id);
  const item = await getNewsItemById(newsId);

  if (!item) {
    notFound();
  }

  const contentParagraphs = splitParagraphs(item.content);
  const publishedDate = dateFormatter.format(new Date(item.publishedAt));

  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-home-alt.jpg')" }}>
        <div className="container">
          <p className="kicker">Новости RUNA</p>
          <h1>{item.title}</h1>
          <p>{item.summary}</p>
          <div className="hero-actions">
            <Link className="btn btn-outline" href="/news">
              Ко всем новостям
            </Link>
            {item.sourceUrl ? (
              <a className="btn btn-primary" href={item.sourceUrl} target="_blank" rel="noopener noreferrer">
                Открыть источник
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="card news-detail-shell">
            <div className="news-detail-meta">
              <span className="news-date">{publishedDate}</span>
              <span className="news-badge">Обновление</span>
            </div>

            <div className="news-detail-cover">{renderNewsMedia(item)}</div>

            <div className="news-detail-body">
              <p className="news-detail-summary">{item.summary}</p>

              {contentParagraphs.length > 0 && (
                <div className="news-detail-content">
                  {contentParagraphs.map((paragraph, index) => (
                    <p key={`${item.id}-paragraph-${index}`}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
