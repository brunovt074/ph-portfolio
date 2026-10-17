import { gsap, ScrollTrigger } from './gsapSetup';
import { onPageReady } from './lifecycle';
import { NO_PREFERENCE } from './motionQueries';

onPageReady(() => {
  const sequence = document.querySelector<HTMLElement>('[data-sequence]');
  const counter = document.querySelector<HTMLElement>('[data-series-counter]');
  if (!sequence || !counter) {
    return;
  }
  const mm = gsap.matchMedia();

  mm.add({ motion: NO_PREFERENCE, reduce: '(prefers-reduced-motion: reduce)' }, (context) => {
    const fadeDuration = context.conditions?.motion ? 0.5 : 0;
    const total = sequence.dataset.total ?? '';
    const number = sequence.dataset.number ?? '';
    const label = counter.querySelector<HTMLElement>('[data-counter-label]');
    if (label) {
      label.textContent = `${number}.1 / ${total}`;
    }
    gsap.set(counter, { autoAlpha: 0 });

    ScrollTrigger.create({
      trigger: sequence,
      start: 'top 60%',
      end: 'bottom 40%',
      onToggle: (self) => gsap.to(counter, { autoAlpha: self.isActive ? 1 : 0, duration: fadeDuration, ease: 'power3.out', overwrite: true }),
    });

    sequence.querySelectorAll<HTMLElement>('[data-position]').forEach((figure) => {
      ScrollTrigger.create({
        trigger: figure,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => {
          if (self.isActive && label) {
            label.textContent = `${number}.${figure.dataset.position} / ${total}`;
          }
        },
      });
    });
  });

  return () => mm.revert();
});
