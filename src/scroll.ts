/**
 * Smoothly scrolls to a page section by hash, positioning the section's primary content
 * container dead-center in the viewport.
 */
export function scrollToSection(hash: string) {
  const id = hash.replace(/^#/, '');
  if (!id) return;

  if (id === 'hero') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const element = document.getElementById(id);
  if (!element) return;

  // Find the primary visual content container within the section
  const content = (
    id === 'socials'
      ? (element.closest('.footer-bottom') as HTMLElement) || element
      : (element.querySelector(
          '.biography-container, .music-video-container, .contact-container, .upcoming-container, .footer-container'
        ) as HTMLElement)
  ) || element;

  const rect = content.getBoundingClientRect();
  const contentHeight = rect.height;
  const viewportHeight = window.innerHeight;

  // Compact navbar floating clearance
  const isMobile = window.innerWidth <= 900;
  const navOffset = isMobile ? 80 : 90;

  // Fine-tuning offsets for specific sections
  // #media scrolls a tiny bit less so the view rests a little further up on the page
  const sectionOffset = id === 'media' ? (isMobile ? 35 : 48) : 0;

  // Calculate target scroll position to center the content vertically in the viewport:
  // viewportCenter = viewportHeight / 2
  // contentCenter = rect.top + (contentHeight / 2)
  const targetY = window.scrollY + rect.top + (contentHeight / 2) - (viewportHeight / 2) - sectionOffset;

  // If the content is taller than the available viewport height,
  // align the top of the content comfortably below the floating navbar:
  const safeTopY = window.scrollY + rect.top - navOffset;
  const finalY = contentHeight > (viewportHeight - navOffset)
    ? Math.max(0, safeTopY)
    : Math.max(0, targetY);

  window.scrollTo({
    top: finalY,
    behavior: 'smooth',
  });
}
