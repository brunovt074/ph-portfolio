import { gsap } from './gsapSetup';
import { onPageReady } from './lifecycle';
import { NO_PREFERENCE } from './motionQueries';

const PARALLAX_AMPLITUDE: Record<string, number> = { encargos: 7, obra: 4.2 };

onPageReady(() => {
  const mm = gsap.matchMedia();

  mm.add(NO_PREFERENCE, () => {
    document.querySelectorAll<HTMLElement>('[data-door]').forEach((door) => {
      const image = door.querySelector('img');
      if (!image) {
        return;
      }
      const amplitude = PARALLAX_AMPLITUDE[door.dataset.door ?? ''] ?? 5;
      gsap.fromTo(
        image,
        { scale: 1.15, yPercent: -amplitude },
        {
          yPercent: amplitude,
          ease: 'none',
          scrollTrigger: { trigger: door, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });
  });

  return () => mm.revert();
});
