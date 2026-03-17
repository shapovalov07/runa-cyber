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
            {totalClubs} клубов в {totalCities} городах: high-FPS конфигурации, PS5-зоны, турниры и комфортные пространства
            для тренировок, игры и отдыха.
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
        <div className="container grid grid-3 stats-grid">
          <article className="card stat reveal">
            <strong className="stat-value">{totalClubs}</strong>
            <p>действующих клубов в сети RUNA</p>
          </article>
          <article className="card stat reveal">
            <strong className="stat-value">{totalCities}</strong>
            <p>города присутствия и расширения сети</p>
          </article>
          <article className="card stat stat-mixed reveal">
            <strong className="stat-value">PC + PS5</strong>
            <p>форматы для ranked-игры, командных сессий и турниров</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Что внутри клубов RUNA</h2>
          <p className="section-lead">
            Во всех локациях RUNA делается акцент на производительность, удобство и атмосферу: быстрые сборки, продуманная
            периферия, отдельные зоны и комфортный сервис.
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
