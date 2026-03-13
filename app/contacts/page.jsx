export const metadata = {
  title: 'Контакты',
  description: 'Контакты RUNA Cyber Club: телефон, сообщения VK, адрес и рабочие ориентиры.',
};

export default function ContactsPage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-contacts.jpg')" }}>
        <div className="container">
          <p className="kicker">Контакты</p>
          <h1>Связаться с RUNA Cyber Club</h1>
          <p>
            Оперативная связь и актуальные обновления публикуются во VK сообщества. Для брони, вопросов по залам и
            мероприятиям лучше писать в сообщения напрямую.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="tel:+79081876161">
              Позвонить
            </a>
            <a className="btn btn-outline" href="https://vk.com/im?sel=-229523120" target="_blank" rel="noopener noreferrer">
              Написать в VK
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-2">
          <article className="card reveal">
            <h3>Телефон</h3>
            <p>
              <a href="tel:+79081876161">+7 (908) 187-61-61</a>
            </p>
          </article>
          <article className="card reveal">
            <h3>VK сообщество</h3>
            <p>
              <a href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
                vk.com/runarostov
              </a>
            </p>
          </article>
          <article className="card reveal">
            <h3>Основной адрес</h3>
            <p>Ростов-на-Дону, ул. Станиславского, 122.</p>
          </article>
          <article className="card reveal">
            <h3>Время связи</h3>
            <p>Лучший канал - сообщения VK. Ответ обычно в течение дня.</p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container info-strip reveal">
          График работы и бронирование лучше уточнять в сообщениях сообщества - там публикуются оперативные обновления и
          акции.
        </div>
      </section>
    </main>
  );
}
