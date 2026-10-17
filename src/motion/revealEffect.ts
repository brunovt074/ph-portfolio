import { gsap } from './gsapSetup';

const HIDDEN = 'inset(100% 0% 0% 0%)';
const SHOWN = 'inset(0% 0% 0% 0%)';

export const containerOf = (element: HTMLElement): HTMLElement =>
  element.matches('.photo') ? element : (element.querySelector<HTMLElement>('.photo') ?? element);

const imagesOf = (containers: HTMLElement[]): HTMLImageElement[] =>
  containers.map((container) => container.querySelector('img')).filter((image) => image !== null);

export const hidePhotos = (containers: HTMLElement[]) => {
  gsap.set(containers, { clipPath: HIDDEN });
  gsap.set(imagesOf(containers), { scale: 1.08 });
};

export const revealPhotos = (containers: HTMLElement[]) => {
  gsap.to(containers, { clipPath: SHOWN, duration: 1.1, ease: 'power3.out', stagger: 0.08, clearProps: 'clipPath' });
  gsap.to(imagesOf(containers), { scale: 1, duration: 1.1, ease: 'power3.out', stagger: 0.08, clearProps: 'transform' });
};
