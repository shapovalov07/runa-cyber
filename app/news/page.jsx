import NewsSection from '@/components/NewsSection';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Все новости',
  description: 'Все публикации RUNA Cyber Club.',
};

export default function NewsPage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-home-alt.jpg')" }}>
        <div className="container">
          <p className="kicker">RUNA Cyber Club</p>
          <h1>Все новости клуба</h1>
          <p>Полная лента публикаций, анонсов и обновлений расписания.</p>
        </div>
      </section>

      <NewsSection
        title="Лента новостей"
        lead="Здесь собраны все публикации RUNA Cyber Club в хронологическом порядке."
      />
    </main>
  );
}
