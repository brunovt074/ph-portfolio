import { gsap, ScrollTrigger } from './gsapSetup';
import { onPageReady } from './lifecycle';
import { NO_PREFERENCE } from './motionQueries';

const BASE_DURATION = 22;
const SETTLE_DELAY = 0.12;

const clamp = (min: number, max: number, value: number) => Math.min(max, Math.max(min, value));

const runTicker = (ticker: HTMLElement) => {
  const track = ticker.querySelector<HTMLElement>('.ticker-track');
  if (!track) {
    return;
  }
  const tween = gsap.to(track, { xPercent: -25, repeat: -1, ease: 'none', duration: BASE_DURATION });
  let direction = 1;
  const settle = gsap.delayedCall(SETTLE_DELAY, () => {
    gsap.to(tween, { timeScale: direction, duration: 0.8, ease: 'power2.out', overwrite: true });
  });

  ScrollTrigger.create({
    trigger: ticker,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? tween.resume() : tween.pause()),
  });

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      direction = self.direction === 0 ? direction : self.direction;
      const boost = clamp(1, 4, 1 + Math.abs(self.getVelocity()) / 600);
      gsap.to(tween, { timeScale: direction * boost, duration: 0.3, overwrite: true });
      settle.restart(true);
    },
  });
};

onPageReady(() => {
  const mm = gsap.matchMedia();

  mm.add(NO_PREFERENCE, () => {
    document.querySelectorAll<HTMLElement>('[data-ticker]').forEach(runTicker);
  });

  return () => mm.revert();
});
