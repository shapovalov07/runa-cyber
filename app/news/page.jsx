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
          <p>Свежие апдейты, громкие анонсы и события, после которых следующий визит в RUNA планируется сам собой.</p>
        </div>
      </section>

      <NewsSection
        title="Лента новостей"
        lead="Хронология всего, чем живет RUNA: от новых форматов до объявлений, где слоты разбирают первыми."
      />
    </main>
  );
}
