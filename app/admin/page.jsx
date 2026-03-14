import AdminPanel from '@/components/AdminPanel';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Админка',
  description: 'Панель управления новостями и галереей RUNA Cyber Club.',
};

export default function AdminPage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-home.jpg')" }}>
        <div className="container">
          <p className="kicker">CMS</p>
          <h1>Админ-панель контента</h1>
          <p>Публикуйте новости и добавляйте фотографии в галерею сайта.</p>
        </div>
      </section>

      <AdminPanel />
    </main>
  );
}
