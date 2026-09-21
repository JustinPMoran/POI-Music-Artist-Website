import { useEffect, useRef } from 'react';

/**
 * The banner artwork moves at 65% of the scroll speed (drifting by 35%),
 * matching the parallax scroll movement of public/poiHeader.png.
 */
export function AllTheThingsWeLove() {
  const bannerRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const banner = bannerRef.current;
    const img = imgRef.current;
    if (!banner || !img) return;

    const motion = matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => {
      if (motion.matches) {
        img.style.setProperty('--parallax', '0px');
        return;
      }
      const rect = banner.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const bannerCenter = rect.top + rect.height / 2;
      // When banner is centered in the viewport, offset is 0px (exact 41% reference crop).
      // As the user scrolls down, the banner moves up in the viewport, so (viewportCenter - bannerCenter)
      // increases, translating the image downward by 35% of the scroll delta.
      // This means the artwork moves up on screen at 65% of the scroll speed,
      // identical to public/poiHeader.png.
      const offset = (viewportCenter - bannerCenter) * 0.35;
      img.style.setProperty('--parallax', `${offset}px`);
    };

    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update, { passive: true });
    motion.addEventListener('change', update);

    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
      motion.removeEventListener('change', update);
    };
  }, []);

  return (
    <section ref={bannerRef} className="things-we-love-banner" aria-label="All The Things We Love">
      <img
        ref={imgRef}
        className="things-we-love-img"
        src="/madEnoughCover.JPEG"
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
      />
      <div className="things-we-love-overlay" aria-hidden="true" />
      <div className="things-we-love-content">
        <h2 className="things-we-love-title">ALL THE THINGS WE LOVE</h2>
        <a
          className="things-we-love-btn"
          href="https://vyd.co/AllTheThingsWeLove"
          target="_blank"
          rel="noopener noreferrer"
        >
          LISTEN HERE
        </a>
      </div>
    </section>
  );
}
