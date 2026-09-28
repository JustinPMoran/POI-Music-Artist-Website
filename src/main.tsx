import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { PhotoCarousel } from './PhotoCarousel';
import { CompactNav } from './CompactNav';
import { UpcomingSingle } from './UpcomingSingle';
import { AllTheThingsWeLove } from './AllTheThingsWeLove';
import { Biography } from './Biography';
import { MusicVideo } from './MusicVideo';
import { Contact } from './Contact';
import { Footer } from './Footer';
import { BackgroundPlayback } from './BackgroundPlayback';
import { scrollToSection } from './scroll';

/** Wait for the actual assets so the entrance never reveals a partial scene. */
function useSceneReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    const images = ['/poiHeader.png', '/poiLogo.webp'].map((src) => {
      const image = new Image();
      image.src = src;
      return image.decode();
    });
    void Promise.allSettled([...images, document.fonts.ready]).then(() => {
      if (mounted) setReady(true);
    });
    return () => { mounted = false; };
  }, []);
  return ready;
}

function Sunrays() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const groups = [...(container.current?.querySelectorAll<HTMLElement>('.sunrays') ?? [])];
    const animations = new Map<HTMLElement, Animation>();
    let stopped = false;

    // The featured light rests bright and occasionally dips; its companions
    // rest dim and twinkle. Every cycle gets fresh, independent timing.
    function glimmer(group: HTMLElement, from: number) {
      if (stopped || motion.matches) return;
      const resting = .12 + Math.random() * .12;
      const peak = .85 + Math.random() * .15;
      const rise = 450 + Math.random() * 400;
      const fall = 700 + Math.random() * 600;
      const pause = 500 + Math.random() * 1600;
      // A 2.5× cycle gives the featured light 40% of the other lights'
      // twinkle frequency (60% fewer), while preserving the pulse speed.
      const featured = group.classList.contains('sunrays-1');
      const frequencyScale = featured ? 2.5 : 1;
      const duration = (rise + fall + pause) * frequencyScale;
      const animation = group.animate(
        featured ? [
          { opacity: from, offset: 0 },
          { opacity: from, offset: (duration - rise - fall) / duration, easing: 'ease-in-out' },
          { opacity: resting, offset: (duration - fall) / duration, easing: 'ease-in-out' },
          { opacity: peak, offset: 1 },
        ] : [
          { opacity: from, offset: 0, easing: 'ease-in-out' },
          { opacity: peak, offset: rise / duration, easing: 'ease-in-out' },
          { opacity: resting, offset: (rise + fall) / duration },
          { opacity: resting, offset: 1 },
        ],
        { duration, fill: 'forwards' },
      );
      const previous = animations.get(group);
      animations.set(group, animation);
      previous?.cancel();
      animation.onfinish = () => glimmer(group, featured ? peak : resting);
    }

    function restart() {
      animations.forEach(animation => { animation.onfinish = null; animation.cancel(); });
      animations.clear();
      if (!motion.matches) groups.forEach(group => glimmer(group, group.classList.contains('sunrays-1') ? .94 : .55));
    }
    restart();
    motion.addEventListener('change', restart);
    return () => {
      stopped = true;
      motion.removeEventListener('change', restart);
      animations.forEach(animation => { animation.onfinish = null; animation.cancel(); });
    };
  }, []);

  return (
    <div ref={container} className="sunray-field">
      {[0, 1, 2].map(index => (
        <div className={`sunrays sunrays-${index + 1}`} key={index}>
          <div className="sunray-halo" />
          <div className="sunray sunray-soft" />
          <div className="sunray sunray-main" />
          <div className="sunray sunray-fine" />
          {index === 0 && <div className="sunray-source" />}
        </div>
      ))}
    </div>
  );
}

/** The artwork moves at 65% of the scroll speed (130px per 200px), so it drifts behind the carousel. */
function Performer() {
  const image = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = image.current!;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      const offset = motion.matches ? 0 : Math.max(0, window.scrollY) * .35;
      element.style.setProperty('--parallax', `${offset}px`);
    };
    update();
    addEventListener('scroll', update, { passive: true });
    motion.addEventListener('change', update);
    return () => {
      removeEventListener('scroll', update);
      motion.removeEventListener('change', update);
    };
  }, []);

  return <img ref={image} className="performer" src="/poiHeader.png" alt="" aria-hidden="true" width="1212" height="1297" fetchPriority="high" />;
}

/** Text renders 20% smaller inside a hidden full-size copy, so each label keeps its original footprint. */
function Label({ className, children, href }: { className: string; children: string; href?: string }) {
  const content = (
    <>
      <span className="label-text">{children}</span>
      <span className="label-sizer" aria-hidden="true">{children}</span>
    </>
  );
  if (href) {
    const isHash = href.startsWith('#');
    return (
      <a
        href={href}
        className={`label ${className}`}
        onClick={(e) => {
          if (isHash) {
            e.preventDefault();
            scrollToSection(href);
            if (window.location.hash !== href) {
              history.pushState(null, '', href);
            }
          }
        }}
      >
        {content}
      </a>
    );
  }
  return <span className={`label ${className}`}>{content}</span>;
}

function ArtistHeader() {
  return (
    <header className="artist-header">
      {/* Labels only: no destinations or additional sections were supplied. */}
      <div className="nav-side nav-left">
        <Label className="socials" href="#socials">SOCIALS</Label>
        <Label className="bio" href="#biography">BIOGRAPHY</Label>
      </div>
      <a
        href="#hero"
        className="logo"
        aria-label="POI Home"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <img src="/poiLogo.webp" alt="POI" width="308" height="180" />
      </a>
      <div className="nav-side nav-right">
        <Label className="media" href="#media">MEDIA</Label>
        <Label className="contact" href="#contact">CONTACT ME</Label>
      </div>
    </header>
  );
}

function App() {
  const ready = useSceneReady();

  useEffect(() => {
    if (ready && window.location.hash) {
      const timer = setTimeout(() => {
        scrollToSection(window.location.hash);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [ready]);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash) {
        scrollToSection(window.location.hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <main>
      <BackgroundPlayback />
      <CompactNav ready={ready} />
      <section className={`hero${ready ? ' is-ready' : ''}`} id="hero" aria-label="POI music artist">
      <div className="stage" aria-hidden="true">
        <div className="glow" />
        <Sunrays />
      </div>
      <Performer />
      <ArtistHeader />
      </section>
      <PhotoCarousel />
      <UpcomingSingle />
      <AllTheThingsWeLove />
      <Biography />
      <MusicVideo />
      <Contact />
      <Footer />
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
