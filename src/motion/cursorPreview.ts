import { gsap } from './gsapSetup';
import { onPageReady } from './lifecycle';
import { FINE_POINTER, NO_PREFERENCE } from './motionQueries';

const MAX_TILT = 6;
const CURSOR_OFFSET = 32;
const TEXT_GAP = 24;

const textRight = (element: Element): number => {
  const range = document.createRange();
  range.selectNodeContents(element);
  return Math.max(...Array.from(range.getClientRects()).map((rect) => rect.right));
};

const placeX = (row: HTMLElement | undefined, box: HTMLElement, pointerX: number): number => {
  const desired = pointerX + CURSOR_OFFSET;
  const texts = row ? Array.from(row.querySelectorAll('.index-title, .index-description')) : [];
  if (!row || texts.length === 0) return desired;
  const minimum = Math.max(...texts.map(textRight)) + TEXT_GAP;
  const thumbs = row.querySelector('.index-thumbs');
  const thumbsLeft = thumbs && thumbs.getClientRects().length > 0 ? thumbs.getBoundingClientRect().left : window.innerWidth;
  const maximum = thumbsLeft - TEXT_GAP - box.offsetWidth;
  const bounded = Math.min(desired, Math.max(minimum, maximum));
  return Math.max(bounded, minimum);
};

const buildPreview = (rows: HTMLElement[]) => {
  const box = document.createElement('div');
  box.className = 'cursor-preview';
  box.setAttribute('aria-hidden', 'true');
  const images = new Map<string, HTMLImageElement>();
  rows.forEach((row) => {
    const source = row.dataset.previewSrc;
    const facet = row.dataset.facet;
    if (!source || !facet) return;
    const image = document.createElement('img');
    image.alt = '';
    image.src = source;
    image.decoding = 'async';
    box.append(image);
    images.set(facet, image);
  });
  document.body.append(box);
  return { box, images };
};

onPageReady(() => {
  const list = document.querySelector<HTMLElement>('[data-index-list]');
  if (!list) {
    return;
  }
  const mm = gsap.matchMedia();

  mm.add(`${NO_PREFERENCE} and ${FINE_POINTER}`, () => {
    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-index-row]'));
    const { box, images } = buildPreview(rows);
    gsap.set(box, { xPercent: 0, yPercent: -50, autoAlpha: 0, scale: 0.9, x: 0, y: 0 });
    gsap.set(Array.from(images.values()), { autoAlpha: 0 });

    const moveX = gsap.quickTo(box, 'x', { duration: 0.6, ease: 'power3' });
    const moveY = gsap.quickTo(box, 'y', { duration: 0.6, ease: 'power3' });
    const tilt = gsap.quickTo(box, 'rotation', { duration: 0.6, ease: 'power3' });
    const untilt = gsap.delayedCall(0.1, () => tilt(0));
    let lastX = 0;
    let activeRow: HTMLElement | undefined;

    const onMove = (event: PointerEvent) => {
      moveX(placeX(activeRow, box, event.clientX));
      moveY(event.clientY);
      tilt(Math.max(-MAX_TILT, Math.min(MAX_TILT, (event.clientX - lastX) * 0.4)));
      lastX = event.clientX;
      untilt.restart(true);
    };

    const show = (facet: string | undefined) => {
      images.forEach((image, key) => gsap.to(image, { autoAlpha: key === facet ? 1 : 0, duration: 0.3, overwrite: true }));
      gsap.to(box, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
    };

    const hide = () => gsap.to(box, { autoAlpha: 0, scale: 0.9, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });

    const enters = rows.map((row) => {
      const enter = (event: PointerEvent) => {
        lastX = event.clientX;
        activeRow = row;
        const targetX = placeX(row, box, event.clientX);
        if (Number(gsap.getProperty(box, 'autoAlpha')) < 0.05) {
          gsap.set(box, { x: targetX, y: event.clientY });
        }
        moveX(targetX);
        moveY(event.clientY);
        show(row.dataset.facet);
      };
      row.addEventListener('pointerenter', enter);
      return () => row.removeEventListener('pointerenter', enter);
    });

    list.addEventListener('pointermove', onMove);
    list.addEventListener('pointerleave', hide);

    return () => {
      list.removeEventListener('pointermove', onMove);
      list.removeEventListener('pointerleave', hide);
      enters.forEach((remove) => remove());
      untilt.kill();
      box.remove();
    };
  });

  return () => mm.revert();
});
