import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export function Biography() {
  const [open, setOpen] = useState(false);
  const frame = useRef<HTMLButtonElement>(null);
  const photo = useRef<HTMLImageElement>(null);

  // Scroll effect: the photo drifts inside its frame as the page scrolls. It is
  // centered when the frame is centered in the viewport, and it uses its full
  // spare height over the frame's whole trip through the viewport, so an edge
  // never shows and the motion never stalls.
  useEffect(() => {
    const box = frame.current!;
    const image = photo.current!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      if (motion.matches) {
        image.style.setProperty('--parallax', '0px');
        return;
      }
      const rect = box.getBoundingClientRect();
      // -1 as the frame enters at the bottom, 0 when centered, 1 as it leaves at the top.
      const travel = (innerHeight / 2 - (rect.top + rect.height / 2)) / (innerHeight / 2 + rect.height / 2);
      // The photo is 30% taller than its frame, so it can drift 15% either way.
      const drift = Math.max(-1, Math.min(1, travel)) * rect.height * .15;
      image.style.setProperty('--parallax', `${drift}px`);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    addEventListener('resize', update);
    motion.addEventListener('change', update);
    return () => {
      removeEventListener('scroll', update);
      removeEventListener('resize', update);
      motion.removeEventListener('change', update);
    };
  }, []);

  return (
    <section className="biography-section" id="biography" aria-label="Biography">
      <div className="biography-container">
        <div className="biography-media">
          <button
            ref={frame}
            type="button"
            className="biography-image-btn"
            onClick={() => setOpen(true)}
            aria-label="View photo of Paul Clasen performing on stage with POI"
          >
            <img
              ref={photo}
              className="biography-image"
              src="/paulBand.jpg"
              alt="Paul Clasen performing on stage with POI"
              width={4284}
              height={5712}
              loading="lazy"
              decoding="async"
            />
          </button>
        </div>
        <div className="biography-text">
          <p className="biography-paragraph">
            Meet Paul Clasen from Boulder, Colorado-<br className="bio-break" />
            the visionary behind POI. With a background<br className="bio-break" />
            in classical percussion and marching arts,<br className="bio-break" />
            POI blends marching snare drum grooves<br className="bio-break" />
            and beautiful percussion, with the sound of<br className="bio-break" />
            Pop and EDM, for a refreshing performance<br className="bio-break" />
            of dance music.
          </p>
          <p className="biography-paragraph">
            It's about satisfying drum rhythms, EDM<br className="bio-break" />
            sonics, and human sounding textures that fit<br className="bio-break" />
            seamlessly into productions with<br className="bio-break" />
            choreographed dances and pop lyrics, that<br className="bio-break" />
            make for an exciting, captivating, and brand<br className="bio-break" />
            new experience that's untapped. POI is the<br className="bio-break" />
            culmination of his creative talents and<br className="bio-break" />
            journey, sonically exploring what defies<br className="bio-break" />
            convention, inviting you into a world of new<br className="bio-break" />
            and organic soundscapes.
          </p>
        </div>
      </div>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Photo of Paul Clasen"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="gallery-close"
            onClick={() => setOpen(false)}
            aria-label="Close photo"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
            <img
              className="gallery-image"
              src="/paulBand.jpg"
              alt="Paul Clasen performing on stage with POI"
            />
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
