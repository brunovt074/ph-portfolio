import { describe, expect, it } from 'vitest';
import { buildRobotsTxt } from '@/seo/buildRobotsTxt';

const sitemap = 'https://sarahmoreau.example/sitemap.xml';

describe('buildRobotsTxt', () => {
  it('blocks every crawler and advertises no sitemap before the launch', () => {
    const text = buildRobotsTxt(sitemap, true);

    expect(text).toContain('Disallow: /\n');
    expect(text).not.toContain('Allow: /');
    expect(text).not.toContain('Sitemap');
  });

  it('allows crawling after the launch while keeping private paths out and advertising the sitemap', () => {
    const text = buildRobotsTxt(sitemap, false);

    expect(text).toContain('Allow: /\n');
    expect(text).not.toMatch(/^Disallow: \/$/m);
    expect(text).toContain('Disallow: /admin');
    expect(text).toContain('Disallow: /reservas/');
    expect(text).toContain(`Sitemap: ${sitemap}`);
  });
});
