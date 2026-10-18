import { expect, test } from '@playwright/test';

const localizedRoutes = ['/en/', '/en/portraits', '/en/brands', '/en/events', '/en/work', '/en/work/prints', '/en/work/oficios', '/pt/', '/pt/retratos', '/pt/obra', '/pt/obra/copias'];

const htmlLang = (route: string): string =>
  route.startsWith('/pt') ? 'pt-BR' : 'en';

test('every localized route answers 200 with one h1 and its html lang', async ({ request }) => {
  for (const route of localizedRoutes) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    expect(html).toContain(`<html lang="${htmlLang(route)}"`);
    expect(html.match(/<h1[ >]/g)?.length ?? 0, route).toBe(1);
  }
});

test('an untranslated English page is not indexed and points to the Spanish one', async ({ page }) => {
  await page.goto('/en/portraits');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/retratos$/);
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
});

test('the sitemap lists only Spanish pages while nothing is translated', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  expect(body).toContain('/retratos</loc>');
  expect(body).not.toContain('/en/');
  expect(body).not.toContain('/pt/');
});

test('language switcher keeps the visitor on the same page', async ({ page }) => {
  await page.goto('/retratos');
  await page.getByRole('link', { name: 'EN' }).click();
  await expect(page).toHaveURL(/\/en\/portraits$/);
});

test('internal links never leave the visitor language', async ({ page }) => {
  for (const route of localizedRoutes) {
    await page.goto(route);
    const prefix = route.startsWith('/pt') ? '/pt' : '/en';
    const hrefs = await page.locator('a[href^="/"]:not([hreflang])').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    const foreign = hrefs.filter((href) => href && !href.startsWith(prefix) && !href.startsWith('#'));
    expect(foreign, route).toEqual([]);
  }
});
