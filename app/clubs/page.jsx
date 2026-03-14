import ClubPhotosSection from '@/components/ClubPhotosSection';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Наши клубы',
  description: 'Наши клубы и игровые зоны RUNA в Ростове-на-Дону: адреса, железо, форматы залов, тарифы и фото.',
};

export default function ClubsPage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-clubs-lounge.jpg')" }}>
        <div className="container">
          <p className="kicker">Наши клубы</p>
          <h1>Локация RUNA в Ростове и игровые зоны клуба</h1>
          <p>
            Основной подтвержденный адрес сообщества: <strong>ул. Станиславского, 122</strong>. В клипах и постах также
            встречаются отдельные игровые локации для ивентов.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="/contacts">
              Связаться с клубом
            </a>
            <a className="btn btn-outline" href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
              VK сообщества
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid-3">
          <article className="card reveal">
            <h3>Основной адрес</h3>
            <p>Ростов-на-Дону, улица Станиславского, 122.</p>
          </article>
          <article className="card reveal">
            <h3>Дополнительные упоминания</h3>
            <p>В клипах: «Моисеева 43Б». В ивент-постах: «ул. Плехановская, 1».</p>
          </article>
          <article className="card reveal">
            <h3>Контакты</h3>
            <p>
              Телефон: <a href="tel:+79081876161">+7 (908) 187-61-61</a>
              <br />
              VK:{' '}
              <a href="https://vk.com/runarostov" target="_blank" rel="noopener noreferrer">
                @runarostov
              </a>
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Зоны и конфигурации</h2>
          <p className="section-lead">Данные из официальной карточки HARDWARE (20 марта 2025).</p>
          <div className="grid grid-2">
            <article className="card reveal">
              <h3>STANDART PREMIUM</h3>
              <ul>
                <li>RTX 5060 Ti, RUNA TECH 27&quot; 380Hz</li>
                <li>i5-14600KF, DDR5 32 GB</li>
                <li>Anda Seat Kaiser 3XL</li>
                <li>Logitech G413 TKL SE + G Pro Hero Wireless + G Pro X</li>
              </ul>
            </article>
            <article className="card reveal">
              <h3>OLYMP DEAD</h3>
              <ul>
                <li>RTX 5060 Ti, RUNA TECH 27&quot; 540Hz</li>
                <li>i5-14600KF, DDR5 32 GB</li>
                <li>Anda Seat Kaiser 3XL</li>
                <li>Logitech G413 TKL SE + G Pro Hero Wireless + G Pro X</li>
              </ul>
            </article>
            <article className="card reveal">
              <h3>SQUAD ZONE</h3>
              <ul>
                <li>RTX 5060 Ti, RUNA TECH 27&quot; 540Hz</li>
                <li>i5-14600KF, DDR5 32 GB</li>
                <li>Anda Seat Kaiser 3XL</li>
                <li>Logitech G413 TKL SE + G Pro Hero Wireless + G Pro X</li>
              </ul>
            </article>
            <article className="card reveal">
              <h3>KILLER FPS</h3>
              <ul>
                <li>RTX 5070 Ti, RUNA TECH 27&quot; 540Hz</li>
                <li>7600X3D, DDR5 32 GB</li>
                <li>Anda Seat Kaiser 3XL</li>
                <li>Gravastar Mercury K1 + Superlight 2 + G Pro X 2 Wireless</li>
              </ul>
            </article>
            <article className="card reveal">
              <h3>HYPE</h3>
              <ul>
                <li>RTX 5070 Ti, RUNA TECH 27&quot; 540Hz</li>
                <li>7600X3D, DDR5 32 GB</li>
                <li>Anda Seat Kaiser 3XL</li>
                <li>Gravastar Mercury K1 + Superlight 2 + G Pro X 2 Wireless</li>
              </ul>
            </article>
            <article className="card reveal">
              <h3>PS5 ROOMS и кинотеатр</h3>
              <ul>
                <li>PS5 ROOMS - 4K 86&quot; экраны</li>
                <li>Отдельный формат для компаний</li>
                <li>Кинотеатр Dolby Atmos</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">Базовые тарифы из PRICE</h2>
          <div className="card reveal" style={{ overflowX: 'auto' }}>
            <table className="table-list" aria-label="Тарифы RUNA">
              <thead>
                <tr>
                  <th>Зона</th>
                  <th>1 час</th>
                  <th>Ночь (23:00-08:00)</th>
                  <th>4 часа</th>
                  <th>6 часов</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>STANDART PREMIUM</td>
                  <td>150 ₽</td>
                  <td>650 ₽</td>
                  <td>500 ₽</td>
                  <td>700 ₽</td>
                </tr>
                <tr>
                  <td>OLYMP DEAD</td>
                  <td>200 ₽</td>
                  <td>1000 ₽</td>
                  <td>700 ₽</td>
                  <td>900 ₽</td>
                </tr>
                <tr>
                  <td>SQUAD ROOM</td>
                  <td>250 ₽</td>
                  <td>1200 ₽</td>
                  <td>900 ₽</td>
                  <td>1100 ₽</td>
                </tr>
                <tr>
                  <td>KILLER FPS</td>
                  <td>300 ₽</td>
                  <td>1500 ₽</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>HYPE</td>
                  <td>300 ₽</td>
                  <td>1500 ₽</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
                <tr>
                  <td>PS5 ROOMS</td>
                  <td>350 ₽</td>
                  <td>1000 ₽</td>
                  <td>1000 ₽</td>
                  <td>1500 ₽</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <ClubPhotosSection />

      <section className="section">
        <div className="container info-strip reveal">
          Полные карточки с характеристиками и ценами:{' '}
          <a href="https://vk.com/@runarostov-zhelezo-i-devaisy" target="_blank" rel="noopener noreferrer">
            HARDWARE
          </a>{' '}
          и{' '}
          <a href="https://vk.com/@runarostov-price" target="_blank" rel="noopener noreferrer">
            PRICE
          </a>
          .
        </div>
      </section>
    </main>
  );
}
