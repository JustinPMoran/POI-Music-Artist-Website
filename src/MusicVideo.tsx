export function MusicVideo() {
  return (
    <section className="music-video-section" id="media" aria-label="Latest Music Video">
      <div className="music-video-container">
        <div className="music-video-header">
          <div className="music-video-title-row">
            <span className="music-video-line" aria-hidden="true" />
            <h2 className="music-video-title">ALL THE THINGS WE LOVE</h2>
            <span className="music-video-line" aria-hidden="true" />
          </div>
          <p className="music-video-subtitle">Latest Music Video!</p>
        </div>
        <div className="music-video-frame-box">
          <iframe
            className="music-video-iframe"
            src="https://www.youtube.com/embed/67IXkAa716E"
            title="SEINLAY &amp; POI - ALL THE THINGS WE LOVE"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
