import PhotoCarousel from '@/components/PhotoCarousel';
import { getGalleryPhotos } from '@/lib/cms-storage';

const fallbackPhotosBySection = {
  home: [
    { id: 'home-fallback-lounge', src: '/images/lounge.jpg', alt: 'Неоновая зона клуба' },
    { id: 'home-fallback-sign', src: '/images/runa-sign.jpg', alt: 'Входная вывеска RUNA Cyber Club' },
    { id: 'home-fallback-people', src: '/images/club-people.jpg', alt: 'Игровая атмосфера RUNA' },
  ],
  clubs: [
    { id: 'clubs-fallback-art', src: '/images/decor-art.jpg', alt: 'Арт-элементы в интерьере RUNA' },
    { id: 'clubs-fallback-bear', src: '/images/decor-bear.jpg', alt: 'Декор в зоне бара и отдыха' },
    { id: 'clubs-fallback-lounge', src: '/images/lounge.jpg', alt: 'Неоновая зона клуба' },
  ],
};

const normalizeSection = (value) => {
  const section = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (section === 'clubs' || section === 'tournaments') return section;
  return 'home';
};

export default async function ClubPhotosSection({ section = 'home', title = 'Фото клуба' }) {
  const gallerySection = normalizeSection(section);
  const photos = await getGalleryPhotos(gallerySection);
  const items = photos.length > 0 ? photos : (fallbackPhotosBySection[gallerySection] ?? fallbackPhotosBySection.home);

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">{title}</h2>
        <PhotoCarousel items={items} />
      </div>
    </section>
  );
}
