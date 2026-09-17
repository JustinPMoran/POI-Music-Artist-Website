export function UpcomingSingle() {
  return (
    <section className="upcoming-single" id="upcoming" aria-label="Upcoming single">
      <div className="upcoming-container">
        <div className="upcoming-header">
          <span className="upcoming-line" aria-hidden="true" />
          <h2 className="upcoming-title">UPCOMING SINGLE</h2>
          <span className="upcoming-line" aria-hidden="true" />
        </div>
        <div className="upcoming-content">
          <div className="upcoming-video-box">
            <video
              className="upcoming-video"
              src="/madEnough.mp4"
              poster="/madEnoughPoster.webp"
              controls
              playsInline
              preload="metadata"
            />
          </div>
          <div className="upcoming-desc">
            <p className="upcoming-preview-text">A PREVIEW OF &quot;MAD ENOUGH&quot;</p>
          </div>
        </div>
      </div>
    </section>
  );
}
