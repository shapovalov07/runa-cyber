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
            Выручка от 2 млн ₽/мес, чистая прибыль от 800 000 ₽, прозрачные расходы и проверенная модель в нескольких
            городах России.
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
        <div className="container grid grid-3 stats-grid">
          <article className="card stat stat-mixed reveal">
            <strong className="stat-value">от 2 млн ₽</strong>
            <p>ориентир месячной выручки</p>
          </article>
          <article className="card stat stat-mixed reveal">
            <strong className="stat-value">от 800 000 ₽</strong>
            <p>ориентир чистой прибыли</p>
          </article>
          <article className="card stat stat-mixed reveal">
            <strong className="stat-value">4 города</strong>
            <p>где уже работает сеть RUNA</p>
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
          <p className="section-lead">Форма отправляет заявку напрямую менеджеру RUNA.</p>
          <FranchiseForm />
        </div>
      </section>
    </main>
  );
}
