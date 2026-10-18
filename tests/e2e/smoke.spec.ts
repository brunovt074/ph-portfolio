import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { path: '/es/', status: 200 },
  { path: '/es/editorial', status: 200 },
  { path: '/es/retratos', status: 200 },
  { path: '/es/marcas', status: 200 },
  { path: '/es/eventos', status: 200 },
  { path: '/es/obra', status: 200 },
  { path: '/es/obra/oficios', status: 200 },
  { path: '/es/obra/geometrias', status: 200 },
  { path: '/es/obra/lo-que-queda', status: 200 },
  { path: '/es/obra/viajes-en-color', status: 200 },
  { path: '/es/obra/copias', status: 200 },
  { path: '/es/reservas', status: 200 },
  { path: '/ruta-inexistente', status: 404 },
];

const screenshotName = (route: string): string => (route === '/' ? 'index' : route.slice(1).replaceAll('/', '-'));

for (const { path: route, status } of routes) {
  test(`smoke ${route}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      const isExpectedNotFound = status === 404 && message.text().includes('status of 404');
      if (message.type() === 'error' && !isExpectedNotFound) {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: 'load' });
    expect(response?.status()).toBe(status);
    await expect(page.locator('h1')).toHaveCount(1);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(overflow).toBe(true);

    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach((image) => {
        image.loading = 'eager';
        image.classList.add('is-loaded');
      });
      const settled = Promise.all(
        Array.from(document.images).map((image) =>
          image.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                image.addEventListener('load', resolve, { once: true });
                image.addEventListener('error', resolve, { once: true });
              }),
        ),
      );
      await Promise.race([settled, new Promise((resolve) => setTimeout(resolve, 15000))]);
    });

    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll<HTMLElement>('[data-caption]'))
        .filter((caption) => (caption.closest('[data-reveal]') ?? caption).getBoundingClientRect().top < window.innerHeight * 0.84)
        .every((caption) => getComputedStyle(caption).opacity === '1'),
    );

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
    expect(blocking.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)).toEqual([]);

    expect(consoleErrors).toEqual([]);

    await page.screenshot({ path: `qa/screenshots/${testInfo.project.name}/${screenshotName(route)}.png`, fullPage: true });
  });
}
