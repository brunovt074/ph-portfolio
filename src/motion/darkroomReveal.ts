import { gsap, ScrollTrigger } from './gsapSetup';
import { arrivedByNavigation, onPageReady } from './lifecycle';
import { NO_PREFERENCE } from './motionQueries';

const EXPOSED = 'brightness(2.2) contrast(0.4)';
const DEVELOPED = 'brightness(1) contrast(1)';

const isSharedElement = (figure: HTMLElement) =>
  Array.from(figure.querySelectorAll<HTMLElement>('.photo')).some((photo) => photo.style.viewTransitionName !== '');

const prepare = (figure: HTMLElement) => {
  const images = Array.from(figure.querySelectorAll('img'));
  const caption = figure.querySelector<HTMLElement>('[data-caption]');
  const skipFilter = arrivedByNavigation() && isSharedElement(figure);

  if (!skipFilter) {
    images.forEach((image) => {
      image.style.transition = 'none';
    });
    gsap.set(images, { opacity: 0, filter: EXPOSED });
  }
  if (caption) {
    gsap.set(caption, { opacity: 0, y: 8 });
  }

  const develop = () => {
    const timeline = gsap.timeline();
    if (!skipFilter) {
      timeline
        .to(images, { opacity: 1, duration: 0.3, ease: 'none' }, 0)
        .to(images, { filter: DEVELOPED, duration: 1.4, ease: 'power2.out', clearProps: 'filter,opacity,transition' }, 0);
    }
    if (caption) {
      timeline.to(caption, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', clearProps: 'opacity,transform' }, 0.3);
    }
  };

  return ScrollTrigger.create({ trigger: figure, start: 'top 85%', once: true, onEnter: develop });
};

onPageReady(() => {
  const mm = gsap.matchMedia();

  mm.add(NO_PREFERENCE, () => {
    const figures = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal="darkroom"]'));
    const triggers = figures.map(prepare);

    return () => {
      triggers.forEach((trigger) => trigger.kill());
      figures.forEach((figure) => {
        gsap.set(figure.querySelectorAll('img'), { clearProps: 'filter,opacity,transition' });
        const caption = figure.querySelector('[data-caption]');
        if (caption) gsap.set(caption, { clearProps: 'opacity,transform' });
      });
    };
  });

  return () => mm.revert();
});
