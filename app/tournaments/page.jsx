import Link from 'next/link';
import PhotoCarousel from '@/components/PhotoCarousel';
import { getGalleryPhotos, getTournamentEvents } from '@/lib/cms-storage';
import { isVideoMediaSrc } from '@/lib/media';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Кибертурниры',
  description: 'Кибертурниры RUNA: расписание активностей, форматы участия, акции и офлайн-ивенты.',
};

const fallbackTournamentPhotos = [
  { id: 'tournament-fallback-fc26', src: '/images/fc26-cup.jpg', alt: 'Турнир FC 26 в RUNA' },
  { id: 'tournament-fallback-promo', src: '/images/promo.jpg', alt: 'Промо активности RUNA' },
  { id: 'tournament-fallback-price', src: '/images/price.jpg', alt: 'Прайс и бонусы RUNA' },
];

const fallbackTournamentEvents = [
  {
    id: 'fallback-event-fc26-weekly',
    title: 'FC 26 WEEKLY',
    summary: 'Еженедельный формат матчей и мини-турниров для игроков любого уровня.',
    imageSrc: '/images/fc26-cup.jpg',
    imageAlt: 'Турнир FC 26 в RUNA',
  },
  {
    id: 'fallback-event-squad-night',
    title: 'Командные ночи',
    summary: 'Ночные сессии для squad-состава с клубными условиями и поддержкой персонала.',
    imageSrc: '/images/promo.jpg',
    imageAlt: 'Командная активность RUNA',
  },
  {
    id: 'fallback-event-club-cup',
    title: 'Клубный кубок',
    summary: 'Офлайн-ивент с призами, активностями и бонусами для постоянных игроков.',
    imageSrc: '/images/price.jpg',
    imageAlt: 'Клубный кубок RUNA',
  },
];

const renderTournamentEventMedia = (item) => {
  const mediaSrc = item?.imageSrc || '';
  const mediaLabel = item?.imageAlt || item?.title || 'Мероприятие RUNA';

  if (isVideoMediaSrc(mediaSrc)) {
    return <video src={mediaSrc} aria-label={mediaLabel} preload="metadata" muted playsInline />;
  }

  return <img src={mediaSrc} alt={mediaLabel} loading="lazy" />;
};

export default async function TournamentsPage() {
  const galleryPhotos = await getGalleryPhotos('tournaments');
  const cmsTournamentEvents = await getTournamentEvents();
  const tournamentPhotos = (galleryPhotos.length > 0 ? galleryPhotos : fallbackTournamentPhotos).slice(0, 3);
  const tournamentEvents = cmsTournamentEvents.length > 0 ? cmsTournamentEvents : fallbackTournamentEvents;

  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-tournaments.jpg')" }}>
        <div className="container">
          <p className="kicker">Кибертурниры</p>
          <h1>Турнирные активности RUNA: офлайн, online и клубные лиги</h1>
          <p>
            Еженедельные FC 26 матчи, клубные кубки, бонусы на пополнение и специальные условия для командных составов.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
              Смотреть анонсы в VK
            </a>
            <a className="btn btn-outline" href="/contacts">
              Записаться через контакты
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3 stats-grid">
          <article className="card stat stat-mixed reveal">
            <strong className="stat-value">Каждую неделю</strong>
            <p>матчи и мини-турниры по FC 26</p>
          </article>
          <article className="card stat stat-mixed reveal">
            <strong className="stat-value">Клубные кубки</strong>
            <p>периодические офлайн-ивенты для игроков клуба</p>
          </article>
          <article className="card stat stat-mixed reveal">
            <strong className="stat-value">Бонусы и акции</strong>
            <p>дополнительные условия по картам и пополнению депозита</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Форматы активностей</h2>
          <p className="section-lead">Регулярные сценарии, которые проходят в клубе для игроков разного уровня.</p>
          <div className="grid grid-2">
            <article className="card reveal">
              <h3>FC 26 WEEKLY</h3>
              <ul>
                <li>Клубные встречи и открытые мини-турниры</li>
                <li>Регистрация через сообщения сообщества</li>
                <li>Подходит для игроков любого уровня</li>
              </ul>
            </article>
            <article className="card reveal">
              <h3>Командные ночи</h3>
              <ul>
                <li>Ночные пакеты для squad-состава</li>
                <li>Фиксированные цены по зонам</li>
                <li>Поддержка персонала и брони мест</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Ближайшие мероприятия</h2>
          <div className="grid grid-3 tournament-events-grid">
            {tournamentEvents.map((item) => (
              <article className="card tournament-event-card reveal" key={item.id || item.imageSrc}>
                {item.id ? (
                  <Link
                    className="tournament-event-card-overlay"
                    href={`/tournaments/${encodeURIComponent(item.id)}`}
                    aria-label={`Открыть мероприятие «${item.title || 'RUNA'}»`}
                  />
                ) : null}
                {renderTournamentEventMedia(item)}
                <div className="tournament-event-content">
                  <h3>{item.title || 'Мероприятие RUNA'}</h3>
                  <p>{item.summary || 'Описание мероприятия скоро появится.'}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Фото кибертурниров</h2>
          <PhotoCarousel items={tournamentPhotos} />
        </div>
      </section>

    </main>
  );
}
