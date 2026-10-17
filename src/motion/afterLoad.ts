export const afterLoad = (loader: () => Promise<unknown>): void => {
  if (document.readyState === 'complete') {
    void loader();
    return;
  }
  window.addEventListener('load', () => void loader(), { once: true });
};
