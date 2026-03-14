import Link from 'next/link';
import ClubPhotosSection from '@/components/ClubPhotosSection';
import NewsSection from '@/components/NewsSection';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-home-alt.jpg')" }}>
        <div className="container">
          <p className="kicker">Ростов-на-Дону</p>
          <h1>RUNA Cyber Club: премиальный киберклуб без лишнего шума</h1>
          <p>
            550 м² киберпространства, топовое железо, PS5 rooms 4K 86&quot;, кинотеатр Dolby Atmos и регулярные игровые
            активности. Вся информация собрана из официального сообщества RUNA в VK.
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
        <div className="container grid grid-3">
          <article className="card stat reveal">
            <strong>550 м²</strong>
            <p>площадь игрового пространства по данным сообщества.</p>
          </article>
          <article className="card stat reveal">
            <strong>5 зон + PS5</strong>
            <p>STANDART PREMIUM, OLYMP DEAD, SQUAD ZONE, KILLER FPS, HYPE, PS5 ROOMS.</p>
          </article>
          <article className="card stat reveal">
            <strong>800+</strong>
            <p>
              подписчиков в VK:{' '}
              <a href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
                vk.com/runarostov
              </a>
              .
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Что внутри клуба</h2>
          <p className="section-lead">
            Из описания и раздела HARDWARE: мониторы 380Hz и 540Hz, процессоры i5-14600KF / 7600X3D, периферия Logitech,
            кресла Anda Seat Kaiser 3XL, отдельные комнаты и продуманная атмосфера.
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

      <ClubPhotosSection />

      <section className="section">
        <div className="container info-strip reveal">
          Источники:{' '}
          <a href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
            VK RUNA Ростов
          </a>
          ,{' '}
          <a href="https://vk.com/@runarostov-zhelezo-i-devaisy" target="_blank" rel="noopener noreferrer">
            HARDWARE
          </a>
          ,{' '}
          <a href="https://vk.com/@runarostov-price" target="_blank" rel="noopener noreferrer">
            PRICE
          </a>
          ,{' '}
          <a href="https://vk.com/@runarostov-akcii" target="_blank" rel="noopener noreferrer">
            PROMO
          </a>
          .
        </div>
      </section>
    </main>
  );
}
