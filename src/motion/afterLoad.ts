export const afterLoad = (loader: () => Promise<unknown>): void => {
  const start = () => void loader();
  if (document.readyState === 'complete') {
    start();
    return;
  }
  window.addEventListener(
    'load',
    () => requestAnimationFrame(() => requestAnimationFrame(start)),
    { once: true },
  );
};
