import PhotoCarousel from '@/components/PhotoCarousel';

const photos = [
  {
    src: '/images/lounge.jpg',
    alt: 'Неоновая зона клуба',
    caption: 'Неоновая зона отдыха и интерьер клуба.',
  },
  {
    src: '/images/runa-sign.jpg',
    alt: 'Входная вывеска RUNA Cyber Club',
    caption: 'Входная зона и фирменная вывеска RUNA.',
  },
  {
    src: '/images/club-people.jpg',
    alt: 'Игровая атмосфера RUNA',
    caption: 'Игровая атмосфера и посадка в клубе.',
  },
  {
    src: '/images/decor-art.jpg',
    alt: 'Арт-элементы в интерьере RUNA',
    caption: 'Детали оформления пространства RUNA.',
  },
  {
    src: '/images/decor-bear.jpg',
    alt: 'Декор в зоне бара и отдыха',
    caption: 'Атмосферный декор в зоне бара и отдыха.',
  },
];

export default function ClubPhotosSection() {
  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Фото клуба</h2>
        <PhotoCarousel items={photos} />
      </div>
    </section>
  );
}
