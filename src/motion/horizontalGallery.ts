import { gsap, ScrollTrigger } from './gsapSetup';
import { isRendered } from './isRendered';
import { onPageReady } from './lifecycle';
import { NO_PREFERENCE, WIDE_VIEWPORT } from './motionQueries';
import { containerOf, hidePhotos, revealPhotos } from './revealEffect';

const HORIZONTAL_CLASS = 'is-horizontal';

const travelOf = (track: HTMLElement) => Math.max(0, track.scrollWidth - track.clientWidth);

const pinGallery = (section: HTMLElement) => {
  const track = section.querySelector<HTMLElement>('.gallery-track');
  if (!track) {
    return () => {};
  }
  section.classList.add(HORIZONTAL_CLASS);

  const scroll = gsap.to(track, {
    x: () => -travelOf(track),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${travelOf(track)}`,
      invalidateOnRefresh: true,
    },
  });

  const figures = Array.from(section.querySelectorAll<HTMLElement>('[data-reveal]')).filter(isRendered);
  const containers = figures.map(containerOf);
  hidePhotos(containers);
  figures.forEach((figure, index) => {
    const container = containers[index];
    if (!container) return;
    ScrollTrigger.create({
      trigger: figure,
      containerAnimation: scroll,
      start: 'left 94%',
      once: true,
      onEnter: () => revealPhotos([container]),
    });
  });

  return () => {
    gsap.set(containers, { clearProps: 'clipPath' });
    section.classList.remove(HORIZONTAL_CLASS);
  };
};

onPageReady(() => {
  const mm = gsap.matchMedia();

  mm.add(`${NO_PREFERENCE} and ${WIDE_VIEWPORT}`, () => {
    const disposers = Array.from(document.querySelectorAll<HTMLElement>('[data-gallery="horizontal"]')).map(pinGallery);
    return () => disposers.forEach((dispose) => dispose());
  });

  return () => mm.revert();
});
