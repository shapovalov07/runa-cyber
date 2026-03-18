import FranchiseForm from '@/components/FranchiseForm';

export const metadata = {
  title: 'Франшиза',
  description: 'Франшиза RUNA Cyber Club: ключевые показатели, модель и отправка заявки.',
};

export default function FranchisePage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-franchise.jpg')" }}>
        <div className="container">
          <p className="kicker">Франшиза</p>
          <h1>Франшиза RUNA: готовая бизнес-модель киберклуба</h1>
          <p>
            Запускайте клуб с брендом, который уже собирает аудиторию: готовая операционная модель, поддержка команды и
            сильная экономика в реальных городах.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#fr-form">
              Оставить заявку
            </a>
            <a className="btn btn-outline" href="https://vk.com/wall-229523120_765" target="_blank" rel="noopener noreferrer">
              Оригинальный пост
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3 stats-grid home-stats-grid">
          <article className="card stat stat-mixed home-stat home-stat-clubs reveal">
            <span className="home-stat-kicker">Выручка</span>
            <strong className="stat-value">от 2 млн ₽</strong>
            <p>ориентир ежемесячного оборота при корректной локации и операционной модели RUNA</p>
            <span className="home-stat-note">Финальный прогноз считается по параметрам вашего города.</span>
          </article>
          <article className="card stat stat-mixed home-stat home-stat-cities reveal">
            <span className="home-stat-kicker">Прибыль</span>
            <strong className="stat-value">от 800 000 ₽</strong>
            <p>планка чистой прибыли при выстроенных процессах и стабильной загрузке клуба</p>
            <span className="home-stat-note">Метрики, KPI и экономика прозрачны для партнера.</span>
          </article>
          <article className="card stat stat-mixed home-stat home-stat-formats reveal">
            <span className="home-stat-kicker">Кейс сети</span>
            <strong className="stat-value">4 города</strong>
            <p>где модель RUNA уже работает вживую и подтверждена ежедневной операционной практикой</p>
            <span className="home-stat-note">От запуска до масштабирования с сопровождением команды.</span>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-2">
          <article className="card reveal">
            <h3>Что получает партнер</h3>
            <ul>
              <li>Премиальный сервис и взрослую целевую аудиторию</li>
              <li>Изолированные комнаты Solo / Duo / Trio</li>
              <li>Топовую периферию и фирменные мониторы</li>
              <li>Прозрачную структуру затрат и операционный контур</li>
            </ul>
          </article>

          <article className="card reveal">
            <h3>Как подать заявку</h3>
            <ul>
              <li>Укажите имя, город и телефон</li>
              <li>Нажмите кнопку отправки формы</li>
              <li>Заявка сразу попадет в Telegram команды RUNA</li>
              <li>Далее менеджер свяжется для расчета под ваш город</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section" id="fr-form">
        <div className="container">
          <h2 className="section-title">Предзаявка на франшизу</h2>
          <p className="section-lead">
            Оставьте контакт, и менеджер RUNA свяжется с вами, чтобы разобрать запуск именно под ваш город.
          </p>
          <FranchiseForm />
        </div>
      </section>
    </main>
  );
}
