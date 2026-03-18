import { getNewsList } from '@/lib/cms-storage';
import Link from 'next/link';
import NewsCardMedia from '@/components/NewsCardMedia';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

export default async function NewsSection({
  title = 'Новости клуба',
  lead = 'Актуальные анонсы, обновления расписания и события RUNA Cyber Club.',
  limit,
  showAllButton = false,
} = {}) {
  const news = await getNewsList();
  const normalizedLimit = Number.isInteger(limit) && limit > 0 ? limit : null;
  const visibleNews = normalizedLimit ? news.slice(0, normalizedLimit) : news;
  const shouldShowAllButton = showAllButton && news.length > 0;

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <p className="section-lead">{lead}</p>

        <div className="news-list">
          {news.length === 0 && (
            <article className="card reveal">
              <h3>Пока нет публикаций</h3>
              <p>Добавьте первую новость через админ-панель, чтобы она появилась на сайте.</p>
            </article>
          )}

          {visibleNews.map((item) => (
            <article className="card news-card reveal" key={item.id}>
              <Link
                className="news-card-overlay"
                href={`/news/${encodeURIComponent(item.id)}`}
                aria-label={`Открыть новость «${item.title}»`}
              />
              <div className="news-media">
                <NewsCardMedia src={item.imageSrc} alt={item.imageAlt || item.title} />
              </div>
              <div className="news-content">
                <div className="news-topline">
                  <span className="news-date">{dateFormatter.format(new Date(item.publishedAt))}</span>
                  <span className="news-badge">Обновление</span>
                </div>
                <h3>{item.title}</h3>
                <p className="news-summary">{item.summary}</p>
                {item.content && <p className="news-extra">{item.content}</p>}
                {item.sourceUrl && (
                  <div className="news-links">
                    <a
                      className="news-link news-link-source"
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Источник
                    </a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {shouldShowAllButton && (
          <div className="news-actions">
            <Link className="btn btn-primary" href="/news">
              Смотреть все новости
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
