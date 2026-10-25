import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsapSetup';
import { onPageReady } from './lifecycle';
import { NO_PREFERENCE } from './motionQueries';

onPageReady(() => {
  const mm = gsap.matchMedia();

  mm.add(NO_PREFERENCE, () => {
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -16 } });
    const tick = (time: number) => lenis.raf(time * 1000);
    const lock = () => lenis.stop();
    const unlock = () => lenis.start();
    const toTop = (event: Event) => {
      event.preventDefault();
      lenis.scrollTo(0);
    };

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    window.addEventListener('lv:lock-scroll', lock);
    window.addEventListener('lv:unlock-scroll', unlock);
    window.addEventListener('lv:scroll-top', toTop);

    return () => {
      window.removeEventListener('lv:lock-scroll', lock);
      window.removeEventListener('lv:unlock-scroll', unlock);
      window.removeEventListener('lv:scroll-top', toTop);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  });

  return () => mm.revert();
});
