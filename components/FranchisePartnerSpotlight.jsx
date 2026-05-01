export default function FranchisePartnerSpotlight({ video }) {
  if (!video) return null;

  const hasEmbed = typeof video.embedUrl === 'string' && video.embedUrl.trim();
  const hasVideo = typeof video.videoSrc === 'string' && video.videoSrc.trim();

  return (
    <article className="card franchise-video-placeholder">
      <div className="franchise-video-copy">
        <p className="kicker">{video.badge}</p>
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        <div className="franchise-video-meta">
          <span>{video.partner}</span>
          <span>{video.city}</span>
        </div>
        <blockquote>{video.quote}</blockquote>
      </div>

      <div className="franchise-video-media">
        {hasEmbed ? (
          <iframe
            src={video.embedUrl}
            title={video.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : hasVideo ? (
          <video controls preload="metadata" poster={video.posterSrc}>
            <source src={video.videoSrc} />
          </video>
        ) : (
          <div className="franchise-video-poster-shell">
            <img src={video.posterSrc} alt={video.title} loading="lazy" />
            <div className="franchise-video-badge">SOON</div>
          </div>
        )}
      </div>
    </article>
  );
}
