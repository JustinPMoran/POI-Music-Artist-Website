import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const photos = [
  { src: '/carousel/image1.webp', alt: 'POI wearing a blue sweater against a white background' },
  { src: '/carousel/image2.webp', alt: 'Black-and-white view of a recording studio mixing desk' },
  { src: '/carousel/image3.webp', alt: 'POI reclining on a couch under blue and pink light' },
  { src: '/carousel/image4.webp', alt: 'POI working at a recording studio console' },
  { src: '/carousel/image5.webp', alt: 'POI playing percussion under blue stage lighting' },
];

export function PhotoCarousel() {
  const viewport = useRef<HTMLElement>(null);
  const [galleryIndex, setGalleryIndex] = useState<number | null>(null);
  const hasDragged = useRef(false);
  const dragStartX = useRef(0);

  useEffect(() => {
    if (galleryIndex === null) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setGalleryIndex(null);
      } else if (event.key === 'ArrowLeft') {
        setGalleryIndex(current => current !== null ? (current - 1 + photos.length) % photos.length : null);
      } else if (event.key === 'ArrowRight') {
        setGalleryIndex(current => current !== null ? (current + 1) % photos.length : null);
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', key);
    };
  }, [galleryIndex]);

  useEffect(() => {
    const element = viewport.current!;
    const group = element.querySelector<HTMLElement>('.carousel-group')!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const hover = matchMedia('(hover: hover) and (pointer: fine)');
    let period = 0;
    let frame = 0;
    let lastTime = 0;
    let remainder = 0;
    let manualUntil = 0;
    let pointerDown = false;
    let dragX: number | null = null;

    const measure = () => {
      const progress = period ? ((element.scrollLeft % period) + period) % period / period : 0;
      period = group.getBoundingClientRect().width;
      element.scrollLeft = period * (1 + progress);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    measure();

    const manual = () => { manualUntil = performance.now() + 1000; };
    let activePointerId: number | null = null;

    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      pointerDown = true;
      manual();
      hasDragged.current = false;
      dragStartX.current = event.clientX;
      dragX = event.clientX;
      activePointerId = event.pointerId;
    };
    const move = (event: PointerEvent) => {
      if (!pointerDown || dragX === null) return;
      if (Math.abs(event.clientX - dragStartX.current) > 6) {
        hasDragged.current = true;
        if (event.pointerType === 'mouse' && !element.hasPointerCapture(event.pointerId)) {
          try {
            element.setPointerCapture(event.pointerId);
          } catch {}
          element.classList.add('is-dragging');
        }
      }
      if (hasDragged.current) {
        element.scrollLeft += dragX - event.clientX;
        dragX = event.clientX;
        manual();
      }
    };
    const up = () => {
      pointerDown = false;
      dragX = null;
      if (activePointerId !== null) {
        if (element.hasPointerCapture(activePointerId)) {
          try {
            element.releasePointerCapture(activePointerId);
          } catch {}
        }
        activePointerId = null;
      }
      element.classList.remove('is-dragging');
      manual();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      manual();
      element.scrollLeft += (event.key === 'ArrowLeft' ? -1 : 1) * element.clientWidth * .35;
    };
    const tick = (time: number) => {
      const elapsed = lastTime ? Math.min(time - lastTime, 50) : 0;
      lastTime = time;
      const highlighted = (hover.matches && element.querySelector('.carousel-photo:hover'))
        || element.querySelector('.carousel-photo:focus-visible');
      if (period && !motion.matches && !pointerDown && !highlighted && time > manualUntil) {
        const before = element.scrollLeft;
        const distance = period / 55000 * elapsed + remainder;
        element.scrollLeft += distance;
        remainder = distance - (element.scrollLeft - before);
      } else {
        remainder = 0;
      }
      // Rebase onto an identical copy, keeping native manual scroll and
      // automatic motion on the same position, including backward wrapping.
      if (period && element.scrollLeft < period * .5) element.scrollLeft += period;
      else if (period && element.scrollLeft >= period * 2) element.scrollLeft -= period;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    element.addEventListener('wheel', manual, { passive: true });
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    element.addEventListener('lostpointercapture', up);
    element.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener('wheel', manual);
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
      element.removeEventListener('lostpointercapture', up);
      element.removeEventListener('keydown', key);
    };
  }, []);

  return (
    <section ref={viewport} className="photo-carousel" aria-label="POI photo gallery. Swipe, drag, or use the arrow keys to browse." tabIndex={0}>
      <div className="carousel-track">
        {/* A copy on each side allows seamless forward and backward scrolling. */}
        {[0, 1, 2].map(copy => (
          <div className="carousel-group" key={copy} aria-hidden={copy !== 1 ? true : undefined}>
            {photos.map((photo, index) => (
              <figure
                className="carousel-photo"
                key={`${copy}-${photo.src}`}
                tabIndex={copy === 1 ? 0 : -1}
                role="button"
                onPointerUp={(e) => {
                  if (e.button === 0 && !hasDragged.current) {
                    setGalleryIndex(index);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasDragged.current) {
                    setGalleryIndex(index);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setGalleryIndex(index);
                  }
                }}
              >
                <img src={photo.src} alt={copy === 1 ? photo.alt : ''} width="1200" height="1200" loading="eager" decoding="async" draggable={false} />
              </figure>
            ))}
          </div>
        ))}
      </div>
      {galleryIndex !== null && typeof document !== 'undefined' && createPortal(
        <div
          className="gallery-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Photo gallery"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setGalleryIndex(null);
            }
          }}
        >
          <button
            type="button"
            className="gallery-close"
            onClick={() => setGalleryIndex(null)}
            aria-label="Close gallery"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <button
            type="button"
            className="gallery-arrow gallery-arrow-prev"
            onClick={(e) => {
              e.stopPropagation();
              setGalleryIndex(current => current !== null ? (current - 1 + photos.length) % photos.length : null);
            }}
            aria-label="Previous photo"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
            <img
              className="gallery-image"
              src={photos[galleryIndex].src}
              alt={photos[galleryIndex].alt}
            />
            <div className="gallery-counter">
              {galleryIndex + 1} / {photos.length}
            </div>
          </div>

          <button
            type="button"
            className="gallery-arrow gallery-arrow-next"
            onClick={(e) => {
              e.stopPropagation();
              setGalleryIndex(current => current !== null ? (current + 1) % photos.length : null);
            }}
            aria-label="Next photo"
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>,
        document.body
      )}
    </section>
  );
}
