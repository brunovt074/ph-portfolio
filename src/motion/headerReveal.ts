import { onPageReady } from './lifecycle';

const HIDE_AFTER_PX = 160;
const SCROLL_TOLERANCE_PX = 6;
const BACK_TO_TOP_AFTER_VIEWPORTS = 1.2;

onPageReady(() => {
  const header = document.querySelector<HTMLElement>('.site-header');
  const backToTop = document.querySelector<HTMLButtonElement>('[data-back-to-top]');
  if (!header) {
    return;
  }
  let lastY = window.scrollY;
  let frame = 0;

  const setHidden = (hidden: boolean) => {
    header.dataset['hidden'] = hidden ? 'true' : 'false';
  };

  const update = () => {
    frame = 0;
    const y = Math.max(window.scrollY, 0);
    const delta = y - lastY;
    if (y < HIDE_AFTER_PX || delta < -SCROLL_TOLERANCE_PX) {
      setHidden(false);
    } else if (delta > SCROLL_TOLERANCE_PX && !header.contains(document.activeElement)) {
      setHidden(true);
    }
    if (Math.abs(delta) > SCROLL_TOLERANCE_PX) {
      lastY = y;
    }
    if (backToTop) {
      backToTop.dataset['visible'] = y > window.innerHeight * BACK_TO_TOP_AFTER_VIEWPORTS ? 'true' : 'false';
    }
  };

  const onScroll = () => {
    if (frame === 0) {
      frame = requestAnimationFrame(update);
    }
  };

  const showHeader = () => setHidden(false);

  const scrollToTop = () => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const handledBySmoothScroll = !window.dispatchEvent(new CustomEvent('lv:scroll-top', { cancelable: true }));
    if (!handledBySmoothScroll) {
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }
    header.querySelector<HTMLElement>('a')?.focus({ preventScroll: true });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  header.addEventListener('focusin', showHeader);
  backToTop?.addEventListener('click', scrollToTop);
  update();

  return () => {
    window.removeEventListener('scroll', onScroll);
    header.removeEventListener('focusin', showHeader);
    backToTop?.removeEventListener('click', scrollToTop);
    cancelAnimationFrame(frame);
    setHidden(false);
  };
});
