import { expect, test } from '@playwright/test';
import { defaultSiteTexts } from '../../src/infrastructure/texts/defaults/defaultSiteTexts';

const localizedRoutes = [
  '/en/',
  '/en/portraits',
  '/en/brands',
  '/en/events',
  '/en/work',
  '/en/work/prints',
  '/en/work/oficios',
  '/pt/',
  '/pt/retratos',
  '/pt/obra',
  '/pt/obra/copias',
];

test('every translated route answers 200 with one h1 and its html lang', async ({ page }) => {
  for (const route of localizedRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('h1'), route).toHaveCount(1);
    await expect(page.locator('html'), route).toHaveAttribute('lang', route.startsWith('/en') ? 'en' : 'pt-BR');
  }
});

test('an untranslated English page is not indexed and points to the Spanish one', async ({ page }) => {
  await page.goto('/en/portraits');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/retratos$/);
  await expect(page.locator('link[hreflang]')).toHaveCount(0);
});

test('the sitemap lists only Spanish pages while nothing is translated', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();

  expect(body).toContain('/retratos</loc>');
  expect(body).not.toContain('/en/');
  expect(body).not.toContain('/pt/');
});

test('language switcher keeps the visitor on the same page', async ({ page, viewport }) => {
  await page.goto('/retratos');
  if (viewport && viewport.width < 900) await page.getByRole('button', { name: 'Menú' }).click();
  await page.getByRole('link', { name: 'EN', exact: true }).filter({ visible: true }).click();

  await expect(page).toHaveURL(/\/en\/portraits$/);
});

test('internal links never leave the visitor language', async ({ page }) => {
  for (const route of localizedRoutes) {
    await page.goto(route);
    const prefix = route.slice(0, 4);
    const hrefs = await page
      .locator('a[href^="/"]:not([hreflang])')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
    expect(hrefs.filter((href) => !href.startsWith(prefix) && !href.startsWith('/_astro/')), route).toEqual([]);
  }
});

const copyShownFromCms = new Set(['pages.printsInquirySubmit', 'nav.copias', 'seo.copiasTitle']);

test('interface copy is not left in Spanish on English pages', async ({ page }) => {
  const spanish = defaultSiteTexts.es;
  const english = defaultSiteTexts.en;
  const leftovers: string[] = [];
  for (const route of ['/en/', '/en/work/prints']) {
    await page.goto(route);
    const visible = await page.evaluate(() => {
      const labels = Array.from(document.querySelectorAll('[aria-label]')).map((node) => node.getAttribute('aria-label') ?? '');
      return `${document.body.innerText}\n${labels.join('\n')}`;
    });
    for (const group of Object.keys(spanish) as (keyof typeof spanish)[]) {
      for (const key of Object.keys(spanish[group]) as never[]) {
        const es = (spanish[group] as Record<string, string>)[key] ?? '';
        const en = (english[group] as Record<string, string>)[key] ?? '';
        if (es.length >= 12 && es !== en && !copyShownFromCms.has(`${group}.${String(key)}`) && visible.includes(es)) leftovers.push(`${route} ${group}.${String(key)}: ${es}`);
      }
    }
  }

  expect(leftovers).toEqual([]);
});
