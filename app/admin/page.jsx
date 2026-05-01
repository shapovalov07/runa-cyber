import AdminPanel from '../../components/AdminPanel';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Админка',
  description: 'Панель управления контентом и заявками франшизы RUNA Cyber Club.',
};

export default function AdminPage() {
  return (
    <main>
      <section className="page-hero" style={{ '--hero-image': "url('/images/hero-home.jpg')" }}>
        <div className="container">
          <p className="kicker">CMS</p>
          <h1>Админ-панель RUNA</h1>
          <p>Управляйте контентом сайта и заявками франшизы из одного внутреннего кабинета.</p>
        </div>
      </section>

      <AdminPanel />
    </main>
  );
}
