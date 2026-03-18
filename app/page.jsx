import Link from 'next/link';
import ClubPhotosSection from '@/components/ClubPhotosSection';
import NewsSection from '@/components/NewsSection';
import { totalCities, totalClubs } from '@/data/clubs';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main>
      <section className="page-hero page-hero-video">
        <video
          className="page-hero-media"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/hero-home-alt.jpg"
          aria-hidden="true"
        >
          <source src="/videos/hero-home.mp4" type="video/mp4" />
        </video>
        <div className="page-hero-overlay" aria-hidden="true" />
        <div className="container">
          <p className="kicker">Сеть RUNA Cyber Club</p>
          <h1>Киберклубы RUNA: единый стандарт игры в разных городах</h1>
          <p>
            {totalClubs} клубов в {totalCities} городах, где каждая сессия ощущается как турнир: high-FPS ПК, PS5-зоны,
            ночные активности и сервис, к которому хочется возвращаться.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/clubs">
              Смотреть залы и железо
            </Link>
            <Link className="btn btn-outline" href="/tournaments">
              Кибертурниры
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3 stats-grid home-stats-grid">
          <article className="card stat home-stat home-stat-clubs reveal">
            <span className="home-stat-kicker">Сеть RUNA</span>
            <strong className="stat-value">{totalClubs}</strong>
            <p>локаций, где мощность ПК и комфорт ощущаются с первой минуты</p>
            <span className="home-stat-note">От быстрых каток после учебы до долгих ночных сессий с командой.</span>
          </article>
          <article className="card stat home-stat home-stat-cities reveal">
            <span className="home-stat-kicker">География</span>
            <strong className="stat-value">{totalCities}</strong>
            <p>города с единым стандартом RUNA: железо, сервис и атмосфера на одном уровне</p>
            <span className="home-stat-note">Воронеж, Саратов, Челябинск и Ростов-на-Дону.</span>
          </article>
          <article className="card stat stat-mixed home-stat home-stat-formats reveal">
            <span className="home-stat-kicker">Форматы</span>
            <strong className="stat-value">PC + PS5</strong>
            <p>переключайтесь между ranked-игрой, турнирами и расслабленным консольным вечером</p>
            <span className="home-stat-note">Solo/Duo/Trio-комнаты и зоны для командных сессий.</span>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Что внутри клубов RUNA</h2>
          <p className="section-lead">
            Здесь продумано все до клика мыши: мощные сборки, свет и звук, приватные комнаты и атмосфера, в которой
            обычный вечер превращается в кибер-ивент.
          </p>
          <div className="grid grid-2 feature-grid">
            <article className="card reveal feature-card">
              <div className="feature-head">
                <h3>FPS-конфигурации</h3>
                <span className="feature-badge">Железо</span>
              </div>
              <ul className="feature-list">
                <li>RTX 5060 Ti и RTX 5070 Ti</li>
                <li>DDR5 32 GB</li>
                <li>RUNA Tech 27&quot; (380/540Hz)</li>
                <li>Logitech G Pro / Superlight 2</li>
              </ul>
            </article>
            <article className="card reveal feature-card">
              <div className="feature-head">
                <h3>Форматы игры и отдыха</h3>
                <span className="feature-badge">Комфорт</span>
              </div>
              <ul className="feature-list">
                <li>Solo / Duo / Trio комнаты</li>
                <li>PS5 ROOMS 4K 86&quot;</li>
                <li>Кинотеатр Dolby Atmos</li>
                <li>Премиум кресла Anda Seat</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <NewsSection limit={4} showAllButton />

      <ClubPhotosSection section="home" />
    </main>
  );
}
