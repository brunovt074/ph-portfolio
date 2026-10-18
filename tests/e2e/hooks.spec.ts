import { expect, test } from '@playwright/test';

const routesWithSplitHeading = [
  '/es/',
  '/es/editorial',
  '/es/retratos',
  '/es/marcas',
  '/es/eventos',
  '/es/obra',
  '/es/obra/oficios',
  '/es/obra/geometrias',
  '/es/obra/lo-que-queda',
  '/es/obra/viajes-en-color',
  '/es/obra/copias',
  '/ruta-inexistente',
];

for (const route of routesWithSplitHeading) {
  test(`heading of ${route} can be split by the motion layer`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator('h1[data-split]')).toHaveCount(1);
  });
}

test('home exposes the two doors, the four index rows and the ticker', async ({ page }) => {
  await page.goto('/es/');

  await expect(page.locator('[data-door]')).toHaveCount(2);
  await expect(page.locator('[data-index-row]')).toHaveCount(4);
  await expect(page.locator('[data-ticker]')).toHaveCount(1);
});

test('eventos exposes the ticker band', async ({ page }) => {
  await page.goto('/es/eventos');

  await expect(page.locator('[data-ticker]')).toHaveCount(1);
});

test('editorial exposes the horizontal gallery', async ({ page }) => {
  await page.goto('/es/editorial');

  await expect(page.locator('[data-gallery="horizontal"]')).toHaveCount(1);
});

test('a series page exposes the photobook sequence', async ({ page }) => {
  await page.goto('/es/obra/geometrias');

  await expect(page.locator('[data-sequence]')).toHaveCount(1);
});

for (const route of ['/es/editorial', '/es/retratos', '/es/eventos']) {
  test(`gallery of ${route} marks its photos for reveal`, async ({ page }) => {
    await page.goto(route);

    expect(await page.locator('[data-reveal]').count()).toBeGreaterThan(0);
  });
}
