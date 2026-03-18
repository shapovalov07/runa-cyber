import ClubsSelector from '@/components/ClubsSelector';
import { clubCities, totalCities, totalClubs } from '@/data/clubs';
import { getGalleryPhotos } from '@/lib/cms-storage';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Наши клубы',
  description:
    'Клубы RUNA в Воронеже, Саратове, Челябинске и Ростове-на-Дону: адреса, телефоны, игровые зоны и конфигурации оборудования.',
};

export default async function ClubsPage() {
  const cityPhotos = await getGalleryPhotos('clubs');

  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-clubs-vk.jpg')" }}>
        <div className="container">
          <p className="kicker">Наши клубы</p>
          <h1>Сеть RUNA в Воронеже, Саратове, Челябинске и Ростове-на-Дону</h1>
          <p>
            {totalClubs} локаций, и каждая как отдельная игровая вселенная: свои зоны, свой ритм и единый стандарт RUNA
            по скорости, комфорту и сервису.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/contacts">
              Связаться с клубом
            </a>
            <a className="btn btn-outline" href="/franchise">
              Открыть клуб по франшизе
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3 stats-grid home-stats-grid">
          <article className="card stat home-stat home-stat-clubs reveal">
            <span className="home-stat-kicker">Клубы сети</span>
            <strong className="stat-value">{totalClubs}</strong>
            <p>действующих площадок с единым стандартом RUNA по железу, сервису и атмосфере</p>
            <span className="home-stat-note">Стабильный опыт в каждом городе, без просадки по качеству.</span>
          </article>
          <article className="card stat home-stat home-stat-cities reveal">
            <span className="home-stat-kicker">Города</span>
            <strong className="stat-value">{totalCities}</strong>
            <p>точки присутствия, где RUNA уже собрал сильное локальное комьюнити игроков</p>
            <span className="home-stat-note">Воронеж, Саратов, Челябинск и Ростов-на-Дону.</span>
          </article>
          <article className="card stat stat-mixed home-stat home-stat-formats reveal">
            <span className="home-stat-kicker">Сценарии</span>
            <strong className="stat-value">PC + PS5</strong>
            <p>форматы для ranked-игры, командных тренировок и расслабленных консольных вечеров</p>
            <span className="home-stat-note">Solo/Duo/Trio-комнаты, буткемпы, турнирные и lounge-зоны.</span>
          </article>
        </div>
      </section>

      <ClubsSelector cities={clubCities} cityPhotos={cityPhotos} />
    </main>
  );
}
