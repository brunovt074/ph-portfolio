import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const SETTLE_MS = 2600;

const trackShift = (page: Page) =>
  page.evaluate(() => {
    const track = document.querySelector('[data-gallery="horizontal"] .gallery-track');
    return track ? new DOMMatrix(getComputedStyle(track).transform).m41 : 0;
  });

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('home heading is readable immediately and photos carry no transform', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const heading = page.locator('h1[data-split]');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS('visibility', 'visible');
    await expect(page.locator('h1 .split-char')).toHaveCount(0);

    const transformed = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.photo img, .photo')).filter((element) => {
        const { transform, clipPath } = getComputedStyle(element);
        return transform !== 'none' || (clipPath !== 'none' && !element.classList.contains('sr-only'));
      }).length,
    );
    expect(transformed).toBe(0);
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
  });

  test('series counter still follows the reader without animation', async ({ page }) => {
    await page.goto('/obra/geometrias');
    await page.evaluate(() => window.scrollTo(0, 1200));

    await expect(page.locator('[data-series-counter]')).toHaveCSS('opacity', '1');
    await expect(page.locator('[data-series-counter]')).toContainText('/ 7');
  });
});

test('photos in the viewport finish their reveal', async ({ page }) => {
  await page.goto('/retratos');
  await page.waitForTimeout(SETTLE_MS);

  const states = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
      .filter((figure) => {
        const rect = figure.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.85 && rect.bottom > 0;
      })
      .map((figure) => {
        const photo = figure.querySelector('.photo') ?? figure;
        return { opacity: getComputedStyle(figure).opacity, clipPath: getComputedStyle(photo).clipPath };
      }),
  );

  expect(states.length).toBeGreaterThan(0);
  for (const state of states) {
    expect(state.opacity).toBe('1');
    expect(['none', 'inset(0%)', 'inset(0px)']).toContain(state.clipPath);
  }
});

test('heading splits into masked characters and keeps its accessible name', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1 .split-char').first()).toBeAttached();
  await expect(page.locator('h1[data-split]')).toHaveAttribute('aria-label', 'Sarah Moreau');
  await expect(page.locator('html')).not.toHaveClass(/motion-pending/);
});

test('before and after slider moves with the keyboard', async ({ page }) => {
  await page.goto('/marcas');

  const slider = page.locator('input[type="range"]').first();
  await slider.scrollIntoViewIfNeeded();
  await slider.focus();
  const before = Number(await slider.inputValue());
  await page.keyboard.press('ArrowRight');

  expect(Number(await slider.inputValue())).toBeGreaterThan(before);
});

test('editorial gallery pins and moves sideways on wide screens only', async ({ page }, testInfo) => {
  const wide = testInfo.project.name === 'desktop-1440';
  const narrow = testInfo.project.name === 'mobile-375';
  test.skip(!wide && !narrow, 'pin is verified at 1440 and 375');

  await page.goto('/editorial');
  await page.waitForTimeout(1200);
  const section = page.locator('[data-gallery="horizontal"]');

  if (narrow) {
    await expect(section).not.toHaveClass(/is-horizontal/);
    expect(await trackShift(page)).toBe(0);
    return;
  }

  await expect(section).toHaveClass(/is-horizontal/);
  await section.evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));
  await page.evaluate(() => window.scrollBy(0, 500));
  await page.waitForTimeout(1500);
  const first = await trackShift(page);
  const top = await section.evaluate((element) => Math.round(element.getBoundingClientRect().top));
  await page.evaluate(() => window.scrollBy(0, 700));
  await page.waitForTimeout(1500);
  const second = await trackShift(page);

  expect(first).toBeLessThan(0);
  expect(second).toBeLessThan(first);
  expect(top).toBe(0);
});

test('lightbox opens from a photo, closes with Escape and returns focus', async ({ page }) => {
  await page.goto('/retratos');
  const link = page.locator('a[data-lightbox]').nth(2);
  await link.scrollIntoViewIfNeeded();
  await page.waitForTimeout(SETTLE_MS);
  await link.click();

  const dialog = page.locator('dialog.lightbox');
  await expect(dialog).toHaveAttribute('open', '');
  await expect(dialog.locator('img')).toHaveAttribute('alt', /.+/);

  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open', '');
  await expect(link).toBeFocused();
});

test('lightbox navigates with the arrow keys', async ({ page }) => {
  await page.goto('/retratos');
  const links = page.locator('a[data-lightbox]');
  await links.nth(2).scrollIntoViewIfNeeded();
  await page.waitForTimeout(SETTLE_MS);
  await links.nth(2).click();

  const image = page.locator('dialog.lightbox img');
  const firstAlt = await image.getAttribute('alt');
  await page.keyboard.press('ArrowRight');

  await expect.poll(() => image.getAttribute('alt')).not.toBe(firstAlt);
});

test('series page shows a counter that follows the scroll', async ({ page }) => {
  await page.goto('/obra/geometrias');
  await page.waitForTimeout(800);
  await page.evaluate(() => window.scrollTo(0, 1100));
  const counter = page.locator('[data-series-counter]');

  await expect(counter).toHaveCSS('opacity', '1');
  const first = await counter.textContent();
  await page.evaluate(() => window.scrollTo(0, 4200));

  await expect.poll(() => counter.textContent()).not.toBe(first);
  expect(await counter.textContent()).toMatch(/^II\.\d+ \/ 7$/);
});

test('client router navigates between obra pages without console errors', async ({ page }) => {
  const problems: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error' || message.type() === 'warning') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));

  await page.goto('/obra');
  await page.evaluate(() => {
    (window as unknown as { __kept: boolean }).__kept = true;
  });
  await page.locator('a.chapter-link').nth(1).click();
  await expect(page).toHaveURL(/\/obra\/geometrias$/);
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.goBack();
  await expect(page).toHaveURL(/\/obra$/);
  await expect(page.locator('[data-reveal="darkroom"]').first()).toBeAttached();

  expect(await page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept)).toBe(true);
  expect(problems).toEqual([]);
});

test('ticker keeps drifting while it is on screen', async ({ page }) => {
  await page.goto('/eventos');
  await page.locator('[data-ticker]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const read = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.ticker-track') as Element).transform).m41);
  const start = await read();
  await page.waitForTimeout(800);

  expect(await read()).not.toBe(start);
});
