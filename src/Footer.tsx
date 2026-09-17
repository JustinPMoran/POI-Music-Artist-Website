import { scrollToSection } from './scroll';

export function Footer() {
  const handleNavClick = (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      scrollToSection(href);
      if (window.location.hash !== href) {
        history.pushState(null, '', href);
      }
    }
  };

  return (
    <footer className="footer-section" aria-label="Footer">
      <div className="footer-container">
        <div className="footer-watermark-wrap">
          {/* Subtle watermark logo in background, fully above the divider line */}
          <a
            href="#hero"
            className="footer-watermark"
            aria-label="POI - Return to top"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
          >
            <img
              src="/poiLogo.webp"
              alt=""
              className="footer-watermark-img"
              width={308}
              height={180}
            />
          </a>

          <div className="footer-main">
          <div className="footer-brand">
            <a
              href="#hero"
              className="footer-logo-link"
              aria-label="POI Home"
              onClick={handleNavClick('#hero')}
            >
              <img
                src="/poiLogo.webp"
                alt="POI"
                className="footer-brand-logo"
                width={308}
                height={180}
              />
            </a>
            <p className="footer-bio">
              Blending marching snare drum grooves, electronic dance music,
              and pop vocals into an electrifying live performance.
            </p>
            <p className="footer-location">Boulder, CO</p>
          </div>

          <nav className="footer-nav" aria-label="Footer navigation">
            <div className="footer-col">
              <h3 className="footer-col-title">MUSIC</h3>
              <ul className="footer-links">
                <li>
                  <a href="#upcoming" className="footer-link" onClick={handleNavClick('#upcoming')}>
                    &ldquo;Mad Enough&rdquo;
                  </a>
                </li>
                <li>
                  <a href="#media" className="footer-link" onClick={handleNavClick('#media')}>
                    &ldquo;All The Things We Love&rdquo;
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">ABOUT</h3>
              <ul className="footer-links">
                <li>
                  <a href="#biography" className="footer-link" onClick={handleNavClick('#biography')}>
                    Biography
                  </a>
                </li>
                <li>
                  <a href="#contact" className="footer-link" onClick={handleNavClick('#contact')}>
                    Press Kit (EPK)
                  </a>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">CONNECT</h3>
              <ul className="footer-links">
                <li>
                  <a href="#contact" className="footer-link" onClick={handleNavClick('#contact')}>
                    Inquiries &amp; Booking
                  </a>
                </li>
                <li>
                  <a href="#contact" className="footer-link" onClick={handleNavClick('#contact')}>
                    Send Message
                  </a>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>

      <div className="footer-divider" aria-hidden="true" />

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} POI. All rights reserved.
          </p>
          <div className="footer-managed">
            <span className="footer-managed-label">Managed by</span>
            <a
              href="https://www.wind-marketing.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-managed-link"
              aria-label="Wind Marketing"
            >
              <img
                src="/windLogo.png"
                alt="Wind Marketing"
                className="footer-managed-logo"
                width={744}
                height={335}
              />
            </a>
          </div>
          <div className="footer-socials" id="socials">
            <a
              href="https://open.spotify.com/artist/50aFofRAF3rHW6rBhQuF0z?si=V9Efzs6MQGyPhUJ7R-kbvQ&nd=1&dlsi=d817696c74714f6e"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              Spotify
            </a>
            <a
              href="https://music.apple.com/us/album/look-into-my-eyes-single/1750818322"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              Apple Music
            </a>
            <a
              href="https://youtube.com/@poi_sounds?si=IVX9cqbX5cZeDZeo"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              YouTube
            </a>
            <a
              href="https://www.instagram.com/poi_sounds"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@poi_sounds"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-social-link"
            >
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
