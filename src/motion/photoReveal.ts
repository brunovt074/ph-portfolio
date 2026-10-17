import { gsap, ScrollTrigger } from './gsapSetup';
import { isRendered } from './isRendered';
import { onPageReady } from './lifecycle';
import { NO_PREFERENCE, WIDE_VIEWPORT } from './motionQueries';
import { containerOf, hidePhotos, revealPhotos } from './revealEffect';

const targetsOutsideHorizontalGallery = (skipHorizontal: boolean): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-reveal="darkroom"])'))
    .filter(isRendered)
    .filter((element) => !(skipHorizontal && element.closest('[data-gallery="horizontal"]')))
    .map(containerOf);

onPageReady(() => {
  const mm = gsap.matchMedia();

  mm.add({ motion: NO_PREFERENCE, wide: WIDE_VIEWPORT }, (context) => {
    if (!context.conditions?.motion) {
      return;
    }
    const containers = targetsOutsideHorizontalGallery(Boolean(context.conditions.wide));
    if (containers.length === 0) {
      return;
    }
    hidePhotos(containers);

    const batches = ScrollTrigger.batch(containers, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => revealPhotos(batch as HTMLElement[]),
    });

    return () => {
      batches.forEach((batch) => batch.kill());
      gsap.set(containers, { clearProps: 'clipPath' });
    };
  });

  return () => mm.revert();
});
