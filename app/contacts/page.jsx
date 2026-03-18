import ContactsByCity from '@/components/ContactsByCity';
import { clubCities } from '@/data/clubs';

export const metadata = {
  title: 'Контакты',
  description: 'Контакты RUNA Cyber Club по городам: адреса, телефоны и ссылки на сообщества клубов.',
};

export default function ContactsPage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-contacts-vk.jpg')" }}>
        <div className="container">
          <p className="kicker">Контакты</p>
          <h1>Контакты RUNA Cyber Club по городам</h1>
          <p>
            Выберите город и выйдите на клуб напрямую за минуту: только актуальные контакты и быстрый путь к брони.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#contacts-by-city">
              Выбрать город
            </a>
            <a className="btn btn-outline" href="/clubs">
              Наши клубы
            </a>
          </div>
        </div>
      </section>

      <ContactsByCity cities={clubCities} />
    </main>
  );
}
