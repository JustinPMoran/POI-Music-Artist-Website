import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { scrollToSection } from './scroll';

/* No destinations have been supplied yet. Add a URL to an `href` (for example
   `mailto:…` or `https://open.spotify.com/…`) and that item becomes a link. */
const appLinks = [
  { label: 'Mail', icon: '/roundedAppIcons/email.png', href: '#contact' },
  {
    label: 'Spotify',
    icon: '/roundedAppIcons/spotify.png',
    href: 'https://open.spotify.com/artist/50aFofRAF3rHW6rBhQuF0z?si=V9Efzs6MQGyPhUJ7R-kbvQ&nd=1&dlsi=d817696c74714f6e',
  },
  {
    label: 'Instagram',
    icon: '/roundedAppIcons/instagram.png',
    href: 'https://www.instagram.com/poi_sounds',
  },
  {
    label: 'Apple Music',
    icon: '/roundedAppIcons/appleMusic.png',
    href: 'https://music.apple.com/us/album/look-into-my-eyes-single/1750818322',
  },
  {
    label: 'YouTube',
    icon: '/roundedAppIcons/youTube.png',
    href: 'https://youtube.com/@poi_sounds?si=IVX9cqbX5cZeDZeo',
  },
  {
    label: 'TikTok',
    icon: '/roundedAppIcons/tikTok.png',
    href: 'https://www.tiktok.com/@poi_sounds',
  },
];

const pages = [
  { label: 'SOCIALS', href: '#socials' },
  { label: 'BIOGRAPHY', href: '#biography' },
  { label: 'MEDIA', href: '#media' },
  { label: 'CONTACT ME', href: '#contact', contact: true },
];

function Destination({ href, className, label, onClick, children }: {
  href: string; className: string; label?: string; onClick?: () => void; children: ReactNode;
}) {
  if (!href) return <span className={className}>{children}</span>;
  const external = /^https?:/.test(href);
  const isHash = href.startsWith('#');

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.();
    if (isHash) {
      e.preventDefault();
      scrollToSection(href);
      if (window.location.hash !== href) {
        history.pushState(null, '', href);
      }
    }
  };

  return (
    <a
      className={className}
      href={href}
      aria-label={label}
      onClick={handleClick}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

/**
 * The app icons start at the bottom of the hero. Once the hero navigation has
 * scrolled away, a compact bar slides in. The icons keep scrolling with the
 * page until their center meets the bar's center line, then shrink and snap in.
 */
export function CompactNav({ ready }: { ready: boolean }) {
  const bar = useRef<HTMLElement>(null);
  const row = useRef<HTMLElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const shown = useRef(false);
  const snapped = useRef(false);
  const snapStart = useRef<DOMRect | null>(null);
  const snap = useRef<Animation | null>(null);
  const [visible, setVisible] = useState(false);
  const [docked, setDocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches);
  const menuId = useId();

  useEffect(() => {
    const checkScroll = () => {
      setScrolled(window.scrollY > 20);
      setHeaderScrolled(window.scrollY > 0);
    };
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 900px)').matches);
    };
    checkScroll();
    checkMobile();
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // The anchor always marks where the icons sit in the hero, even while docked.
    const updateDock = () => {
      if (window.matchMedia('(max-width: 900px)').matches) {
        snap.current?.cancel();
        snapStart.current = null;
        if (snapped.current) {
          snapped.current = false;
          setDocked(false);
        }
        return;
      }
      const place = anchor.current!.getBoundingClientRect();
      const barCenter = bar.current!.offsetTop + bar.current!.offsetHeight / 2;
      const dock = shown.current && place.top + place.height / 2 <= barCenter;
      if (dock === snapped.current) return;
      snapped.current = dock;
      // Measured before React moves the row, so the snap starts from here.
      snapStart.current = row.current!.getBoundingClientRect();
      setDocked(dock);
    };

    const targets = document.querySelectorAll('.artist-header .logo, .artist-header .label');
    const inView = new Set<Element>();
    // Only hand over once the hero logo and labels are completely out of view.
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? inView.add(entry.target) : inView.delete(entry.target));
      const show = inView.size === 0;
      if (show !== shown.current) {
        shown.current = show;
        setVisible(show);
        if (!show) setOpen(false);
      }
      updateDock();
    });
    targets.forEach(target => observer.observe(target));
    addEventListener('scroll', updateDock, { passive: true });
    addEventListener('resize', updateDock);
    return () => {
      observer.disconnect();
      removeEventListener('scroll', updateDock);
      removeEventListener('resize', updateDock);
    };
  }, []);

  useLayoutEffect(() => {
    const element = row.current!;
    const first = snapStart.current;
    snapStart.current = null;
    snap.current?.cancel();
    if (!first || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (first.bottom < 0 || first.top > innerHeight) return;
    const last = element.getBoundingClientRect();
    const scale = first.width / last.width;
    snap.current = element.animate([
      { transform: `translate(${first.left - last.left}px, ${first.top - last.top}px) scale(${scale})` },
      { transform: 'none' },
    ], { duration: 300, easing: 'cubic-bezier(.34, 1.4, .64, 1)' });
  }, [docked]);

  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      button.current?.focus();
    };
    const outside = (event: PointerEvent) => {
      if (!bar.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', key);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', key);
      document.removeEventListener('pointerdown', outside);
    };
  }, [open]);

  return (
    <>
      <div ref={anchor} className="app-links-anchor" aria-hidden="true" />
      <nav
        ref={row}
        className={`app-links${docked ? ' is-docked' : ''}${ready ? ' is-ready' : ''}${(isMobile ? headerScrolled : scrolled) ? ' is-scrolled' : ''}${isMobile ? ' is-mobile' : ''}`}
        aria-label="Listen and follow"
      >
        <ul>
          {appLinks.map(app => (
            <li key={app.label} className={app.label === 'Mail' ? 'app-link-mail' : undefined}>
              <Destination className="app-link" href={app.href} label={app.label}>
                <img src={app.icon} alt={app.href ? '' : app.label} width="40" height="40" />
              </Destination>
            </li>
          ))}
        </ul>
      </nav>
      <nav
        ref={bar}
        className={`compact-nav${visible ? ' is-visible' : ''}${headerScrolled ? ' is-scrolled' : ''}${isMobile ? ' is-mobile' : ''}${open ? ' is-open' : ''}`}
        aria-label="Site"
        inert={!isMobile && !visible ? true : undefined}
      >
        {/* The pill and the menu are siblings so each can blur the page behind it. */}
        <div className="compact-bar">
          <a
            href="#hero"
            className="compact-logo-link"
            aria-label="POI Home"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <img className="compact-logo" src="/poiLogo.webp" alt="POI" width="308" height="180" />
          </a>
          <button
            ref={button}
            type="button"
            className={`menu-button${open ? ' is-open' : ''}`}
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen(current => !current)}
          >
            <span /><span /><span />
          </button>
        </div>
        <div id={menuId} className={`menu-panel${open ? ' is-open' : ''}`} inert={!open ? true : undefined}>
          <ul className="menu-list">
            {pages.map(page => (
              <li key={page.label}>
                <Destination
                  className={`menu-item${page.contact ? ' menu-item-contact' : ''}`}
                  href={page.href}
                  onClick={() => setOpen(false)}
                >
                  {page.label}
                </Destination>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
