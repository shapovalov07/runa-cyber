import PhotoCarousel from '@/components/PhotoCarousel';
import { getGalleryPhotos } from '@/lib/cms-storage';

export default async function ClubPhotosSection() {
  const photos = await getGalleryPhotos();

  return (
    <section className="section">
      <div className="container">
        <h2 className="section-title">Фото клуба</h2>
        <PhotoCarousel items={photos} />
      </div>
    </section>
  );
}
