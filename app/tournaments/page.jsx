export const metadata = {
  title: 'Кибертурниры',
  description: 'Кибертурниры RUNA: расписание активностей, форматы участия, акции и офлайн-ивенты.',
};

export default function TournamentsPage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-tournaments.jpg')" }}>
        <div className="container">
          <p className="kicker">Кибертурниры</p>
          <h1>Турнирные активности RUNA: офлайн, online и клубные лиги</h1>
          <p>
            В VK регулярно публикуются активности: еженедельные FC 26 матчи, клубные кубки, бонусы на пополнение и
            специальные условия для команд.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
              Смотреть анонсы в VK
            </a>
            <a className="btn btn-outline" href="/contacts">
              Записаться через контакты
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          <article className="card stat reveal">
            <strong>Каждую неделю</strong>
            <p>матчи и мини-турниры по FC 26.</p>
          </article>
          <article className="card stat reveal">
            <strong>Клубные кубки</strong>
            <p>периодические офлайн-ивенты для игроков клуба.</p>
          </article>
          <article className="card stat reveal">
            <strong>Бонусы и акции</strong>
            <p>дополнительные условия по картам и пополнению депозита.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Форматы активностей</h2>
          <p className="section-lead">По карточкам PROMO и PRICE (март 2025).</p>
          <div className="grid grid-2">
            <article className="card reveal">
              <h3>FC 26 WEEKLY</h3>
              <ul>
                <li>Клубные встречи и открытые мини-турниры</li>
                <li>Регистрация через сообщения сообщества</li>
                <li>Подходит для игроков любого уровня</li>
              </ul>
            </article>
            <article className="card reveal">
              <h3>Командные ночи</h3>
              <ul>
                <li>Ночные пакеты для squad-состава</li>
                <li>Фиксированные цены по зонам</li>
                <li>Поддержка персонала и брони мест</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          <figure className="photo-tile reveal">
            <img src="/images/fc26-cup.jpg" alt="Турнир FC 26 в RUNA" loading="lazy" />
          </figure>
          <figure className="photo-tile reveal">
            <img src="/images/promo.jpg" alt="Промо активности RUNA" loading="lazy" />
          </figure>
          <figure className="photo-tile reveal">
            <img src="/images/price.jpg" alt="Прайс и бонусы RUNA" loading="lazy" />
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="container info-strip reveal">
          Для участия в активностях пишите в сообщения сообщества:{' '}
          <a href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
            vk.com/runarostov
          </a>
          . Формат и даты обновляются в VK.
        </div>
      </section>
    </main>
  );
}
