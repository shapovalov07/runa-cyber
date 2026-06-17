import FranchiseCalculator from '../../components/FranchiseCalculator';
import FranchiseFaqList from '../../components/FranchiseFaqList';
import FranchiseForm from '../../components/FranchiseForm';
import FranchiseImageCarousel from '../../components/FranchiseImageCarousel';
import FranchiseNetworkMap from '../../components/FranchiseNetworkMap';
import FranchisePartnerSpotlight from '../../components/FranchisePartnerSpotlight';
import {
  franchiseAboutGallery,
  franchiseBrandBlocks,
  franchiseCases,
  franchiseDifferentiators,
  franchiseFaq,
  franchiseHeroStats,
  franchiseNetwork,
  franchisePartnerVideo,
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
  const year = new Date().getFullYear();

  return (
    <main className="franchise-landing">
      <div className="franchise-standalone-header">
        <div className="container franchise-standalone-header-row">
          <a className="franchise-standalone-brand" href="#franchise-top" aria-label="RUNA Franchise">
            <img src="/images/runa-logo-header-wordmark.png" alt="RUNA Cyber Club" />
          </a>

          <nav className="franchise-standalone-nav" aria-label="Навигация лендинга франшизы">
            <a href="https://runa-cyber.ru/">Главная</a>
            <a href="#franchise-calculator">Калькулятор</a>
            <a href="#franchise-terms">Условия</a>
            <a href="#franchise-network">Сеть</a>
            <a href="#franchise-faq">FAQ</a>
          </nav>

          <a
            className="btn btn-primary franchise-standalone-cta"
            href="#franchise-final-form"
            data-metrika-event="franchise_cta_click"
            data-metrika-source="landing_header"
            data-metrika-label="Получить расчет"
          >
            Получить расчет
          </a>
        </div>
      </div>

      <section className="franchise-hero">
        <div className="container franchise-hero-grid" id="franchise-top">
          <div className="franchise-hero-copy">
            <p className="kicker">RUNA Franchise</p>
            <h1>Откройте RUNA Cyber Club в своем городе</h1>
            <p className="franchise-hero-lead">
              RUNA — премиальная сеть компьютерных клубов нового поколения. Запустите клуб с продуманным дизайном,
              сильной бизнес-моделью, поддержкой команды и расчетом под ваш город.
            </p>

            <div className="hero-actions">
              <a
                className="btn btn-primary"
                href="#franchise-final-form"
                data-metrika-event="franchise_cta_click"
                data-metrika-source="hero_primary"
                data-metrika-label="Получить расчет под мой город"
              >
                Получить расчет под мой город
              </a>
              <a
                className="btn btn-outline"
                href="#franchise-gallery"
                data-metrika-event="franchise_cta_click"
                data-metrika-source="hero_secondary"
                data-metrika-label="Посмотреть, как выглядит RUNA"
              >
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
              description="Оставьте контакты, и команда RUNA свяжется с вами, чтобы обсудить город и бюджет."
              submitLabel="Получить расчет"
              compact
              showBudget={false}
              showComment={false}
            />
          </div>
        </div>
      </section>

      <div className="franchise-mobile-sticky-cta">
        <a
          className="btn btn-primary"
          href="#franchise-final-form"
          data-metrika-event="franchise_cta_click"
          data-metrika-source="mobile_sticky_cta"
          data-metrika-label="Получить расчет"
        >
          Получить расчет
        </a>
      </div>

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

          <FranchiseImageCarousel items={franchiseAboutGallery} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Позиционирование</p>
            <h2 className="section-title">Мы создаем не обычный компьютерный зал, а место, куда хочется возвращаться</h2>
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

      <section className="section" id="franchise-calculator">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Калькулятор</p>
            <h2 className="section-title">Выберите формат клуба и посмотрите финансовую модель</h2>
          </div>
          <FranchiseCalculator />
        </div>
      </section>

      <section className="section" id="franchise-terms">
        <div className="container">
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
        </div>
      </section>

      <section className="section" id="franchise-network">
        <div className="container">
          <div className="card franchise-network-card franchise-network-card-standalone">
            <div className="franchise-section-head franchise-section-head-tight">
              <p className="kicker">Карта сети</p>
              <h2 className="section-title">9 клубов в сети и точки на этапе открытия</h2>
            </div>

            <FranchiseNetworkMap items={franchiseNetwork} />
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
                <img src={item.imageSrc} alt={item.city} loading="lazy" />
                <p className="franchise-zone-accent">{item.status}</p>
                <h3>{item.city}</h3>
                <p className="admin-path">{item.address}</p>
                <p>{item.note}</p>
              </article>
            ))}
          </div>

          <FranchisePartnerSpotlight video={franchisePartnerVideo} />
        </div>
      </section>

      <section className="section" id="franchise-roadmap">
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

          <div className="franchise-roadmap-form-sticky">
            <FranchiseForm
              source="turnkey_form"
              title="Обсудить запуск под ключ"
              description="Оставьте контакты, и мы разберем ваш город, помещение и подходящую модель запуска."
              submitLabel="Обсудить запуск"
              compact
              showBudget
              showComment={false}
            />
          </div>
        </div>
      </section>

      <section className="section franchise-support-section" id="franchise-support">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">Поддержка после открытия</p>
            <h2 className="section-title">Партнер не остается один после запуска</h2>
            <p className="section-lead">
              RUNA регулярно отслеживает показатели клубов через SmartShell и помогает найти причину просадки: в
              администраторах, маркетинге, сервисе или операционных процессах.
            </p>
          </div>

          <div className="franchise-support-panel">
            <div className="franchise-support-grid">
              {franchiseSupport.map((item, index) => (
                <article className="franchise-support-card" key={item}>
                  <strong>{String(index + 1).padStart(2, '0')}</strong>
                  <span>{item}</span>
                </article>
              ))}
            </div>
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

      <section className="section" id="franchise-city-check">
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
            showComment={false}
          />
        </div>
      </section>

      <section className="section" id="franchise-faq">
        <div className="container">
          <div className="franchise-section-head">
            <p className="kicker">FAQ</p>
            <h2 className="section-title">Ключевые вопросы перед запуском</h2>
          </div>

          <FranchiseFaqList items={franchiseFaq} />
        </div>
      </section>

      <section className="section">
        <div className="container franchise-final-cta" id="franchise-final-form">
          <div className="franchise-section-head franchise-section-head-tight">
            <p className="kicker">Финальная заявка</p>
            <h2 className="section-title">Получите расчет клуба RUNA под ваш город</h2>
            <p className="section-lead">
              Оставьте контакты — команда RUNA свяжется с вами, уточнит город и бюджет, затем подготовит
              индивидуальный расчет.
            </p>
          </div>

          <FranchiseForm
            source="final_form"
            title="Финальная форма заявки"
            description="Заполните поля, и мы вернемся с предметным расчетом по вашей локации."
            submitLabel="Получить расчет"
            showBudget
            showComment
            showSecondaryAction={false}
          />
        </div>
      </section>

      <footer className="franchise-standalone-footer">
        <div className="container franchise-footer-shell">
          <div className="franchise-footer-top">
            <div className="franchise-footer-brand">
              <a href="#franchise-top" aria-label="Наверх к началу лендинга">
                <img src="/images/runa-logo-provided-crop.png" alt="RUNA Cyber Club" />
              </a>
              <p>
                Франшиза RUNA для партнеров, инвесторов и предпринимателей, которые хотят открыть премиальный
                компьютерный клуб в своем городе.
              </p>
            </div>

            <div className="franchise-footer-col">
              <h3>Разделы</h3>
              <nav className="franchise-footer-links" aria-label="Навигация подвала">
                <a href="#franchise-gallery">О франшизе</a>
                <a href="#franchise-calculator">Калькулятор</a>
                <a href="#franchise-terms">Условия</a>
                <a href="#franchise-network">Карта сети</a>
                <a href="#franchise-faq">FAQ</a>
              </nav>
            </div>

            <div className="franchise-footer-col">
              <h3>Связь</h3>
              <div className="franchise-footer-links">
                <a
                  href="#franchise-final-form"
                  data-metrika-event="franchise_cta_click"
                  data-metrika-source="landing_footer"
                  data-metrika-label="Получить расчет"
                >
                  Получить расчет
                </a>
                <a
                  href="#franchise-top"
                  data-metrika-event="franchise_cta_click"
                  data-metrika-source="landing_footer"
                  data-metrika-label="Вернуться наверх"
                >
                  Вернуться наверх
                </a>
              </div>
            </div>
          </div>

          <div className="franchise-footer-bottom">
            <div>© {year} RUNA Franchise.</div>
            <div className="footer-source">
              <span>Сайт разработан в</span>
              <a
                className="footer-source-link"
                href="https://design-hope.ru/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ДИЗАЙН НОРЕ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
