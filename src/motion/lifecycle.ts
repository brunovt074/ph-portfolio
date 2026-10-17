type Cleanup = (() => void) | void;

let ready = document.readyState === 'complete';
let navigated = false;

document.addEventListener('astro:page-load', () => {
  ready = true;
});

document.addEventListener('astro:after-swap', () => {
  navigated = true;
});

document.addEventListener('astro:before-swap', () => {
  ready = false;
});

export const onPageReady = (setup: () => Cleanup): void => {
  let cleanup: Cleanup;

  const start = () => {
    cleanup?.();
    cleanup = setup();
  };

  const stop = () => {
    cleanup?.();
    cleanup = undefined;
  };

  document.addEventListener('astro:page-load', start);
  document.addEventListener('astro:before-swap', stop);

  if (ready) {
    start();
  }
};

export const arrivedByNavigation = (): boolean => navigated;
