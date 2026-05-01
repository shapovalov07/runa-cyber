import FranchiseCalculator from '../../components/FranchiseCalculator';
import FranchiseForm from '../../components/FranchiseForm';
import {
  franchiseAboutGallery,
  franchiseBrandBlocks,
  franchiseCases,
  franchiseDifferentiators,
  franchiseFaq,
  franchiseHeroStats,
  franchiseNetwork,
  franchiseRevenueStreams,
  franchiseRoadmap,
  franchiseSupport,
  franchiseTerms,
  franchiseZones,
} from '../../data/franchise';

export const metadata = {
  title: 'Франшиза RUNA - премиальные компьютерные клубы нового поколения',
  description:
    'Откройте премиальный компьютерный клуб RUNA в своем городе. Инвестиции от 10 млн ₽, прибыль от 600 000 ₽, окупаемость от 15 месяцев, запуск под ключ и поддержка сети.',
  openGraph: {
    title: 'Франшиза RUNA - премиальные компьютерные клубы нового поколения',
    description:
      'Откройте премиальный компьютерный клуб RUNA в своем городе. Инвестиции от 10 млн ₽, прибыль от 600 000 ₽, окупаемость от 15 месяцев, запуск под ключ и поддержка сети.',
    url: 'https://runa-cyber.ru/franchise',
    siteName: 'RUNA Cyber Club',
    locale: 'ru_RU',
    type: 'website',
    images: [
      {
        url: '/images/hero-franchise.jpg',
        width: 1600,
        height: 900,
        alt: 'Франшиза RUNA Cyber Club',
      },
    ],
  },
};

export default function FranchisePage() {
  return (
    <main className="franchise-landing">
      <section className="franchise-hero">
        <div className="container franchise-hero-grid">
          <div className="franchise-hero-copy">
            <p className="kicker">RUNA Franchise</p>
            <h1>Откройте клуб, в который хочется возвращаться — и бизнес, который можно масштабировать.</h1>
            <p className="franchise-hero-lead">
              RUNA — премиальная сеть компьютерных клубов нового поколения. Запустите клуб с продуманным дизайном,
              сильной бизнес-моделью, поддержкой команды и расчетом под ваш город.
            </p>

            <div className="hero-actions">
              <a className="btn btn-primary" href="#franchise-final-form">
                Получить расчет под мой город
              </a>
              <a className="btn btn-outline" href="#franchise-gallery">
                Посмотреть, как выглядит RUNA
              </a>
            </div>

            <div className="franchise-hero-stats">
              {franchiseHeroStats.map((item) => (
                <article className="franchise-hero-stat" key={item.label}>
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </article>
              ))}
            </div>
          </div>

          <div className="franchise-hero-form">
            <FranchiseForm
              source="hero_form"
              title="Получить расчет под мой город"
              description="Оставьте контакты, и команда RUNA свяжется с вами, чтобы обсудить город, бюджет и формат."
              submitLabel="Получить расчет"
              compact
              showBudget={false}
              showFormat={false}
              showComment={false}
            />
          </div>
        </div>
        <div className="franchise-mobile-sticky-cta">
          <a className="btn btn-primary" href="#franchise-final-form">
            Получить расчет
          </a>
        </div>
      </section>

      <section className="section" id="franchise-gallery">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Что такое RUNA</p>
            <h2 className="section-title">RUNA — это клуб, куда приходят не только играть</h2>
            <p className="section-lead">
              RUNA объединяет игровой зал, lounge-пространство, бар, приватные комнаты, PlayStation-зоны,
              мероприятия и атмосферу, за которую гости готовы платить больше.
            </p>
          </div>

          <div className="franchise-gallery-grid">
            {franchiseAboutGallery.map((item) => (
              <article className="franchise-gallery-card" key={item.title}>
                <img src={item.src} alt={item.alt} loading="lazy" />
                <div className="franchise-gallery-card-copy">
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Позиционирование</p>
            <h2 className="section-title">Мы создаем не потоковый компьютерный зал, а место, куда хочется возвращаться</h2>
          </div>

          <div className="franchise-compare-grid">
            {franchiseDifferentiators.map((item) => (
              <article className="card franchise-compare-card" key={item.title}>
                <h3>{item.title}</h3>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Зоны клуба</p>
            <h2 className="section-title">Каждая зона клуба работает на атмосферу, чек и возвращаемость гостей</h2>
            <p className="section-lead">
              Bootcamp, SOLO и DUO-комнаты — самые прибыльные зоны клуба. Бар способен давать 25–30% выручки, поэтому
              RUNA проектируется как место, где гости остаются дольше и тратят больше.
            </p>
          </div>

          <div className="franchise-zones-grid">
            {franchiseZones.map((zone) => (
              <article className="card franchise-zone-card" key={zone.title}>
                <p className="franchise-zone-accent">{zone.accent}</p>
                <h3>{zone.title}</h3>
                <p>{zone.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Выручка</p>
            <h2 className="section-title">RUNA не зависит только от почасовой аренды ПК</h2>
            <p className="section-lead">
              Бизнес-модель собирается из нескольких потоков дохода. Это снижает зависимость от одного сценария
              потребления и дает больше устойчивости точке.
            </p>
          </div>

          <div className="franchise-revenue-grid">
            {franchiseRevenueStreams.map((item) => (
              <article className="franchise-revenue-card" key={item}>
                <span>{item}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Калькулятор</p>
            <h2 className="section-title">Выберите формат клуба и посмотрите финансовую модель</h2>
          </div>
          <FranchiseCalculator />
        </div>
      </section>

      <section className="section">
        <div className="container franchise-two-column">
          <div className="card franchise-terms-card">
            <div className="franchise-section-head franchise-section-head-tight">
              <p className="kicker">Условия франшизы</p>
              <h2 className="section-title">Коротко и прозрачно по входу в модель</h2>
            </div>

            <div className="franchise-terms-list">
              {franchiseTerms.map((item) => (
                <div className="franchise-term-row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="card franchise-network-card">
            <div className="franchise-section-head franchise-section-head-tight">
              <p className="kicker">Карта сети</p>
              <h2 className="section-title">9 клубов в сети и точки на этапе открытия</h2>
            </div>

            <div className="franchise-network-list">
              {franchiseNetwork.map((item) => (
                <article className="franchise-network-item" key={`${item.city}-${item.address}`}>
                  <strong>{item.city}</strong>
                  <p>{item.address}</p>
                  <span>{item.status}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Кейсы партнеров</p>
            <h2 className="section-title">Модель уже работает в сети и масштабируется внутри партнерств</h2>
          </div>

          <div className="franchise-cases-grid">
            {franchiseCases.map((item) => (
              <article className="card franchise-case-card" key={item.city}>
                <p className="franchise-zone-accent">{item.status}</p>
                <h3>{item.city}</h3>
                <p className="admin-path">{item.address}</p>
                <p>{item.note}</p>
              </article>
            ))}
          </div>

          <article className="card franchise-video-placeholder">
            <div>
              <p className="kicker">Видеоотзыв партнера — скоро</p>
              <h3>Видеоистория Ильи из Ростова-на-Дону появится на сайте после открытия клуба</h3>
              <p>
                Илья расскажет, почему выбрал франшизу RUNA, как проходил запуск и какие планы по масштабированию
                появились после старта проекта.
              </p>
            </div>
            <div className="franchise-video-badge">PLAY</div>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container franchise-two-column franchise-roadmap-layout">
          <div>
            <div className="franchise-section-head franchise-section-head-tight">
              <p className="kicker">Открытие под ключ</p>
              <h2 className="section-title">Паушальный взнос — это не право на логотип, а реальное участие команды RUNA</h2>
            </div>

            <div className="franchise-roadmap-list">
              {franchiseRoadmap.map((item, index) => (
                <article className="franchise-roadmap-step" key={item}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{item}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <FranchiseForm
              source="turnkey_form"
              title="Обсудить запуск под ключ"
              description="Оставьте контакты, и мы разберем ваш город, помещение и подходящий формат клуба."
              submitLabel="Обсудить запуск"
              compact
              showBudget
              showFormat
              showComment={false}
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Поддержка после открытия</p>
            <h2 className="section-title">Партнер не остается один после запуска</h2>
            <p className="section-lead">
              RUNA регулярно отслеживает показатели клубов через SmartShell и помогает найти причину просадки: в
              администраторах, маркетинге, сервисе или операционных процессах.
            </p>
          </div>

          <div className="franchise-support-grid">
            {franchiseSupport.map((item) => (
              <article className="franchise-support-card" key={item}>
                <span>{item}</span>
              </article>
            ))}
          </div>

          <div className="franchise-brand-grid">
            {franchiseBrandBlocks.map((item) => (
              <article className="card franchise-brand-card" key={item.title}>
                <h3>{item.title}</h3>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                <p>{item.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container franchise-city-check">
          <div className="franchise-section-head franchise-section-head-tight">
            <p className="kicker">Эксклюзив на город</p>
            <h2 className="section-title">Мы не открываем несколько клубов RUNA в одном городе без стратегии</h2>
            <p className="section-lead">
              Эксклюзив на город возможен, но обсуждается индивидуально — с учетом потенциала рынка, формата клуба и
              планов партнера по развитию.
            </p>
          </div>

          <FranchiseForm
            source="city_check_form"
            title="Проверить город"
            description="Введите город и контакты. Команда RUNA вручную проверит потенциал рынка и даст обратную связь."
            submitLabel="Проверить город"
            compact
            showBudget={false}
            showFormat={false}
            showComment={false}
          />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">FAQ</p>
            <h2 className="section-title">Ключевые вопросы перед запуском</h2>
          </div>

          <div className="franchise-faq-list">
            {franchiseFaq.map((item) => (
              <details className="franchise-faq-item" key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container franchise-final-cta" id="franchise-final-form">
          <div className="franchise-section-head franchise-section-head-tight">
            <p className="kicker">Финальная заявка</p>
            <h2 className="section-title">Получите расчет клуба RUNA под ваш город</h2>
            <p className="section-lead">
              Оставьте контакты — команда RUNA свяжется с вами, уточнит город, бюджет, формат и подготовит
              индивидуальный расчет.
            </p>
          </div>

          <FranchiseForm
            source="final_form"
            title="Финальная форма заявки"
            description="Заполните поля, и мы вернемся с предметным расчетом по вашей локации."
            submitLabel="Получить расчет"
            showBudget
            showFormat
            showComment
            showSecondaryAction={false}
          />
        </div>
      </section>
    </main>
  );
}
