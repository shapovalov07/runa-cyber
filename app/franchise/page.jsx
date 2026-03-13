import FranchiseForm from '@/components/FranchiseForm';

export const metadata = {
  title: 'Франшизы',
  description: 'Франшиза RUNA Cyber Club: ключевые показатели, модель и отправка заявки.',
};

export default function FranchisePage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-franchise.jpg')" }}>
        <div className="container">
          <p className="kicker">Франшизы</p>
          <h1>Франшиза RUNA: готовая бизнес-модель киберклуба</h1>
          <p>
            По закрепленному посту сообщества: выручка от 2 млн ₽/мес, чистая прибыль от 800 000 ₽, прозрачные расходы и
            проверенная модель в 4 городах России.
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
        <div className="container grid grid-3">
          <article className="card stat reveal">
            <strong>от 2 млн ₽</strong>
            <p>месячная выручка по данным сообщества.</p>
          </article>
          <article className="card stat reveal">
            <strong>от 800 000 ₽</strong>
            <p>чистая прибыль по опубликованной модели.</p>
          </article>
          <article className="card stat reveal">
            <strong>4 города</strong>
            <p>где формат уже заявлен как подтвержденный.</p>
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
