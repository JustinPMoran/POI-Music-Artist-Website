# POI artist page

React + TypeScript with Vite. The desktop composition is calibrated to the supplied 1920 × 1080 reference. Mobile and tablet use a portrait crop with the same artwork and labels.

## Run

Requires Node.js 20.19+ or 22.12+.

```sh
npm ci
npm run dev
```

```sh
npm run build
npm run preview
```

The production website is generated in `dist/`.

## Design and assets

- `public/poiHeader.png`, `public/poiLogo.webp`, and `public/favicon.ico` are byte-for-byte copies of the provided originals.
- Animated cyan stage-light rays follow the additional reference, with the original featured light and glowing source plus two added shafts extending above the viewport. All three independently twinkle with randomized soft brightness peaks and quiet intervals. Reduced-motion preferences keep the rays static.
- The CSS glow uses `#005cb2`, `#003380`, and `#00005a`.
- CONTACT uses the locally bundled Open Sauce Sans Bold font from https://github.com/marcologous/Open-Sauce-Fonts, with its SIL Open Font License in `public/fonts/OFL.txt`.
- The first-load reveal waits for image decoding and fonts; reduced-motion preferences disable the animation.
- No link destinations were supplied. The four labels are intentionally static text rather than nonfunctional links. The requested photo carousel appears below the hero.

## Reference limitations

The supplied background is a transparent cutout. The reference screenshot includes microphones, stage equipment, atmospheric grain, and lighting detail absent from this cutout. These cannot be replicated exactly using only the required assets and a CSS glow. The screenshot is not used as a flattened replacement for the site. The explicitly requested CONTACT bold font is visibly heavier than the screenshot lettering.

## Verification

Production TypeScript/Vite build; browser screenshots at 1920×1080, 390×844, 320×568, and 768×1024; font loading; no page overflow; no browser runtime errors; reduced-motion behavior. Desktop and mobile captures are in `docs/`.

## Photo carousel

`src/PhotoCarousel.tsx` uses the five original WebP files in `public/carousel/`. Three identical groups allow continuous scrolling in either direction with the scrollbar hidden. Automatic leftward movement shares the native scroll position with trackpad scrolling, touch swipes, mouse dragging, and arrow-key browsing.

Hovering an image pauses automatic movement, enlarges the image 3.5%, and dims the others. Leaving restores the images and resumes from the current position. Manual input gets a short grace period before automatic scrolling resumes. Keyboard focus also pauses and highlights an image. Reduced motion disables automatic movement while keeping manual browsing available.

Browser verification covers horizontal wheel input in both directions, mouse dragging, keyboard input, automatic pause/resume, forward/backward wrapping, hidden scrollbars, mobile motion and overflow, and reduced motion.

## App icons and compact navigation

The six icons from `public/roundedAppIcons/` start in a row at the bottom of the hero. Once the hero logo and labels scroll out of view, `src/CompactNav.tsx` slides in a fixed bar with `poiLogo.webp` on the left and a menu button on the right. The icons fly up into the center of the bar, and they fly back when the hero navigation returns. The menu lists SOCIALS, BIOGRAPHY, MEDIA, and CONTACT ME. It closes on Escape, an outside click, choosing an item, or scrolling back to the hero. With reduced motion, the icons move without animating.

No destinations have been supplied yet, so the icons and menu items are static. Fill in the `href` values at the top of `CompactNav.tsx` (`mailto:` or `https://` URLs) and each becomes a link. Web links open in a new tab.

The hero label text is 20% smaller than the original. Each label is centered in a hidden full-size copy of its text, so the positions are unchanged.
