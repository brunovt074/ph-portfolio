import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/editorial', '/retratos', '/marcas', '/eventos', '/obra', '/obra/oficios', '/obra/geometrias', '/obra/copias'];

const screenshotName = (route: string): string => (route === '/' ? 'index' : route.slice(1).replaceAll('/', '-'));

for (const route of routes) {
  test(`smoke ${route}`, async ({ page }, testInfo) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    page.on('pageerror', (error) => consoleErrors.push(error.message));

    const response = await page.goto(route, { waitUntil: 'load' });
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1')).toHaveCount(1);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    expect(overflow).toBe(true);

    await page.evaluate(async () => {
      document.querySelectorAll('img').forEach((image) => image.classList.add('is-loaded'));
      await Promise.all(
        Array.from(document.images).map((image) =>
          image.complete ? Promise.resolve() : new Promise((resolve) => image.addEventListener('load', resolve, { once: true })),
        ),
      );
    });

    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
    expect(blocking.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`)).toEqual([]);

    expect(consoleErrors).toEqual([]);

    await page.screenshot({ path: `qa/screenshots/${testInfo.project.name}/${screenshotName(route)}.png`, fullPage: true });
  });
}
