import { expect, test } from '@playwright/test';

const routesWithSplitHeading = [
  '/',
  '/editorial',
  '/retratos',
  '/marcas',
  '/eventos',
  '/obra',
  '/obra/oficios',
  '/obra/geometrias',
  '/obra/lo-que-queda',
  '/obra/viajes-en-color',
  '/obra/copias',
  '/reservas',
  '/ruta-inexistente',
];

for (const route of routesWithSplitHeading) {
  test(`heading of ${route} can be split by the motion layer`, async ({ page }) => {
    await page.goto(route);

    await expect(page.locator('h1[data-split]')).toHaveCount(1);
  });
}

test('home exposes the two doors, the four index rows and the ticker', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-door]')).toHaveCount(2);
  await expect(page.locator('[data-index-row]')).toHaveCount(4);
  await expect(page.locator('[data-ticker]')).toHaveCount(1);
});

test('eventos exposes the ticker band', async ({ page }) => {
  await page.goto('/eventos');

  await expect(page.locator('[data-ticker]')).toHaveCount(1);
});

test('editorial exposes the horizontal gallery', async ({ page }) => {
  await page.goto('/editorial');

  await expect(page.locator('[data-gallery="horizontal"]')).toHaveCount(1);
});

test('a series page exposes the photobook sequence', async ({ page }) => {
  await page.goto('/obra/geometrias');

  await expect(page.locator('[data-sequence]')).toHaveCount(1);
});

for (const route of ['/editorial', '/retratos', '/eventos']) {
  test(`gallery of ${route} marks its photos for reveal`, async ({ page }) => {
    await page.goto(route);

    expect(await page.locator('[data-reveal]').count()).toBeGreaterThan(0);
  });
}
