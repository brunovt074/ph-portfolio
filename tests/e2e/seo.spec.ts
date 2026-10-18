import { expect, test } from '@playwright/test';

const indexablePages = [
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
  '/es/reservas',
];

interface PageSeo {
  title: string;
  description: string;
  canonical: string;
  ogImage: string;
}

const readSeo = async (page: import('@playwright/test').Page, route: string): Promise<PageSeo> => {
  await page.goto(route);
  return page.evaluate(() => ({
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
    ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? '',
  }));
};

test('every indexable page has its own title, description, canonical and share image', async ({ page }) => {
  const entries: PageSeo[] = [];
  for (const route of indexablePages) {
    entries.push(await readSeo(page, route));
  }

  entries.forEach((entry) => {
    expect(entry.title.length).toBeGreaterThan(0);
    expect(entry.description.length).toBeGreaterThan(20);
    expect(entry.canonical).toMatch(/^https?:\/\//);
    expect(entry.ogImage).toMatch(/^https?:\/\//);
  });
  (['title', 'description', 'canonical', 'ogImage'] as const).forEach((key) => {
    const values = entries.map((entry) => entry[key]);
    expect(new Set(values).size, `${key} must be unique`).toBe(values.length);
  });
});

test('pages declare Open Graph and Twitter cards for Spanish speakers in Argentina', async ({ page }) => {
  await page.goto('/es/marcas');

  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'es_AR');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
  await expect(page.locator('meta[property="og:image:alt"]')).not.toHaveAttribute('content', '');
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
});

test('home describes Sarah as a person and a professional service in valid JSON-LD', async ({ page }) => {
  await page.goto('/es/');

  const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll((nodes) => nodes.map((node) => node.textContent ?? ''));
  const schemas = blocks.map((block) => JSON.parse(block) as Record<string, unknown>);

  expect(schemas.map((schema) => schema['@type'])).toEqual(['Person', 'ProfessionalService']);
  expect(schemas[0]?.['jobTitle']).toBe('Fotógrafa y realizadora audiovisual');
  expect(schemas[1]?.['areaServed']).toBe('AR');
  expect(JSON.stringify(schemas)).not.toMatch(/\[[A-ZÚ]+\]/);
  expect(schemas[1]).not.toHaveProperty('telephone');
  expect(schemas[1]).not.toHaveProperty('address');
});

test('prints page lists every artwork without inventing prices', async ({ page }) => {
  await page.goto('/es/obra/copias');

  const block = await page.locator('script[type="application/ld+json"]').first().textContent();
  const schema = JSON.parse(block ?? '{}') as { '@type': string; itemListElement: { item: Record<string, unknown> }[] };

  expect(schema['@type']).toBe('ItemList');
  expect(schema.itemListElement.length).toBeGreaterThan(0);
  schema.itemListElement.forEach(({ item }) => {
    expect(item['@type']).toBe('VisualArtwork');
    expect(item['artform']).toBe('Fotografía');
    expect(item).not.toHaveProperty('offers');
  });
});

test('sitemap and robots.txt respond and keep private paths out', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const body = await sitemap.text();
  expect(body).toContain('/es/obra/copias</loc>');
  expect(body).toContain('/es/reservas</loc>');
  expect(body).not.toMatch(/\/es\/reservas\/[^<]+</);
  expect(body).not.toContain('/api/');
  expect(body).not.toContain('/contacto');
  expect(body).not.toContain('/admin');

  const robots = await request.get('/robots.txt');
  expect(robots.status()).toBe(200);
  const text = await robots.text();
  expect(text).toContain('Disallow: /admin');
  expect(text).toContain('/sitemap.xml');
  expect(text).toContain('Disallow: /reservas/');
  expect(text).toContain('Disallow: /api/');
});

test('a Spanish page keeps its own canonical and stays indexable', async ({ page }) => {
  await page.goto('/es/retratos');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/es\/retratos$/);
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test('result pages of the form stay out of search results', async ({ page }) => {
  await page.goto('/es/contacto/enviado');

  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
});
