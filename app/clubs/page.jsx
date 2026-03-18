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
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-clubs-lounge.jpg')" }}>
        <div className="container">
          <p className="kicker">Наши клубы</p>
          <h1>Сеть RUNA в Воронеже, Саратове, Челябинске и Ростове-на-Дону</h1>
          <p>
            {totalClubs} действующих локаций с разными игровыми форматами: high-FPS зоны, отдельные комнаты и консольные
            пространства.
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
        <div className="container grid grid-3 stats-grid">
          <article className="card stat reveal">
            <strong className="stat-value">{totalClubs}</strong>
            <p>клубов в текущей сети RUNA</p>
          </article>
          <article className="card stat reveal">
            <strong className="stat-value">{totalCities}</strong>
            <p>города присутствия</p>
          </article>
          <article className="card stat stat-mixed reveal">
            <strong className="stat-value">PC + PS5</strong>
            <p>форматы под турнирную игру, тренировки и отдых</p>
          </article>
        </div>
      </section>

      <ClubsSelector cities={clubCities} cityPhotos={cityPhotos} />
    </main>
  );
}
