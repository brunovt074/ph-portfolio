import { isRendered } from './isRendered';
import { onPageReady } from './lifecycle';
import { NO_PREFERENCE } from './motionQueries';

const SHARED_NAME = 'lv-photo';
const LINK_SELECTOR = 'a[data-lightbox]';

const preload = (href: string) => {
  const image = new Image();
  image.src = href;
  return image;
};

const mountLightbox = (dialog: HTMLDialogElement) => {
  const image = dialog.querySelector<HTMLImageElement>('[data-lightbox-image]');
  const closeButton = dialog.querySelector<HTMLButtonElement>('[data-lightbox-close]');
  const previousButton = dialog.querySelector<HTMLButtonElement>('[data-lightbox-previous]');
  const nextButton = dialog.querySelector<HTMLButtonElement>('[data-lightbox-next]');
  if (!image || !closeButton || !previousButton || !nextButton) {
    return () => {};
  }

  const motion = window.matchMedia(NO_PREFERENCE);
  const canMorph = () => motion.matches && typeof document.startViewTransition === 'function';

  let group: HTMLAnchorElement[] = [];
  let index = 0;
  let queue: Promise<void> = Promise.resolve();
  const enqueue = (task: () => Promise<void>) => {
    queue = queue.then(task).catch(() => undefined);
  };

  const current = () => group[index];
  const thumbOf = (link: HTMLAnchorElement): HTMLElement => link.querySelector<HTMLElement>('.photo') ?? link;

  const siblingsOf = (link: HTMLAnchorElement) => {
    const scope = link.closest('[data-lightbox-group]') ?? document;
    return Array.from(scope.querySelectorAll<HTMLAnchorElement>(LINK_SELECTOR)).filter(isRendered);
  };

  const loadInto = async (link: HTMLAnchorElement) => {
    image.alt = link.dataset.alt ?? '';
    image.src = link.href;
    await image.decode().catch(() => undefined);
  };

  const syncControls = () => {
    const single = group.length < 2;
    previousButton.hidden = single;
    nextButton.hidden = single;
  };

  const open = async (link: HTMLAnchorElement) => {
    if (dialog.open) {
      return;
    }
    group = siblingsOf(link);
    index = Math.max(0, group.indexOf(link));
    syncControls();
    window.dispatchEvent(new CustomEvent('lv:lock-scroll'));

    if (canMorph()) {
      const thumb = thumbOf(link);
      thumb.style.viewTransitionName = SHARED_NAME;
      const transition = document.startViewTransition(async () => {
        thumb.style.viewTransitionName = '';
        await loadInto(link);
        image.style.viewTransitionName = SHARED_NAME;
        dialog.showModal();
      });
      await transition.finished.catch(() => undefined);
      image.style.viewTransitionName = '';
    } else {
      await loadInto(link);
      dialog.showModal();
    }
    closeButton.focus();
  };

  const close = async () => {
    const link = current();
    if (!dialog.open || !link) {
      return;
    }
    const thumb = thumbOf(link);
    thumb.scrollIntoView({ block: 'nearest', behavior: 'instant' });

    if (canMorph()) {
      image.style.viewTransitionName = SHARED_NAME;
      const transition = document.startViewTransition(() => {
        image.style.viewTransitionName = '';
        thumb.style.viewTransitionName = SHARED_NAME;
        dialog.close();
      });
      await transition.finished.catch(() => undefined);
      thumb.style.viewTransitionName = '';
    } else {
      dialog.close();
    }
    link.focus({ preventScroll: true });
    window.dispatchEvent(new CustomEvent('lv:unlock-scroll'));
  };

  const step = async (direction: number) => {
    if (!dialog.open || group.length < 2) {
      return;
    }
    index = (index + direction + group.length) % group.length;
    const link = group[index];
    if (link) {
      if (motion.matches) {
        await image.animate({ opacity: [1, 0] }, { duration: 160, fill: 'forwards' }).finished;
        await loadInto(link);
        await image.animate({ opacity: [0, 1] }, { duration: 260, fill: 'forwards' }).finished;
      } else {
        await loadInto(link);
      }
      image.getAnimations().forEach((animation) => animation.cancel());
    }
  };

  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(LINK_SELECTOR);
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    enqueue(() => open(link));
  };

  const onWarm = (event: Event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(LINK_SELECTOR);
    if (link) preload(link.href);
  };

  const onCancel = (event: Event) => {
    event.preventDefault();
    enqueue(close);
  };

  const trapFocus = (event: KeyboardEvent) => {
    const controls = [closeButton, previousButton, nextButton].filter((control) => !control.hidden);
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !controls.includes(active as HTMLButtonElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && (active === last || !controls.includes(active as HTMLButtonElement))) {
      event.preventDefault();
      first.focus();
    }
  };

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Tab') trapFocus(event);
    if (event.key === 'ArrowRight') enqueue(() => step(1));
    if (event.key === 'ArrowLeft') enqueue(() => step(-1));
  };

  const onDialogClick = (event: MouseEvent) => {
    const target = event.target as Element;
    if (target === dialog || target.hasAttribute('data-lightbox-stage')) {
      enqueue(close);
    }
  };

  const onClose = () => enqueue(close);
  const onPrevious = () => enqueue(() => step(-1));
  const onNext = () => enqueue(() => step(1));

  document.addEventListener('click', onClick, true);
  document.addEventListener('pointerover', onWarm);
  document.addEventListener('focusin', onWarm);
  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('keydown', onKeydown);
  dialog.addEventListener('click', onDialogClick);
  closeButton.addEventListener('click', onClose);
  previousButton.addEventListener('click', onPrevious);
  nextButton.addEventListener('click', onNext);

  return () => {
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('pointerover', onWarm);
    document.removeEventListener('focusin', onWarm);
    dialog.removeEventListener('cancel', onCancel);
    dialog.removeEventListener('keydown', onKeydown);
    dialog.removeEventListener('click', onDialogClick);
    closeButton.removeEventListener('click', onClose);
    previousButton.removeEventListener('click', onPrevious);
    nextButton.removeEventListener('click', onNext);
    if (dialog.open) {
      dialog.close();
      window.dispatchEvent(new CustomEvent('lv:unlock-scroll'));
    }
  };
};

onPageReady(() => {
  const dialog = document.querySelector<HTMLDialogElement>('dialog[data-lightbox-dialog]');
  return dialog ? mountLightbox(dialog) : undefined;
});
