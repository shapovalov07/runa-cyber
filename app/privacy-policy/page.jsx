export const metadata = {
  title: 'Политика конфиденциальности',
  description: 'Краткая информация о работе с cookies и обращениями пользователей на сайте RUNA Cyber Club.',
};

export default function PrivacyPolicyPage() {
  return (
    <main>
      <section className="page-hero privacy-hero" style={{ '--hero-image': "url('/images/hero-contacts-vk.jpg')" }}>
        <div className="container">
          <p className="kicker">Документы</p>
          <h1>Политика конфиденциальности RUNA Cyber Club</h1>
          <p>
            На этой странице собрана базовая информация о том, какие данные сайт может получать при работе форм,
            аналитики и cookie-уведомления.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container privacy-policy-content">
          <article className="card">
            <h2>Cookies</h2>
            <p>
              Сайт использует cookies, чтобы запомнить согласие с уведомлением, поддерживать корректную работу страниц и
              оценивать качество взаимодействия с сайтом.
            </p>
          </article>
          <article className="card">
            <h2>Заявки и обратная связь</h2>
            <p>
              Данные, отправленные через формы, используются для обработки обращения, связи с пользователем и внутреннего
              учета заявок RUNA Cyber Club.
            </p>
          </article>
          <article className="card">
            <h2>Аналитика</h2>
            <p>
              На сайте могут использоваться аналитические инструменты, которые помогают понимать посещаемость страниц и
              улучшать структуру разделов.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
