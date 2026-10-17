import { describe, expect, it } from 'vitest';
import { ListSitemapEntries } from '@/application/ListSitemapEntries';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { allFacets } from '../fixtures/aFacet';
import { allSeries } from '../fixtures/aSeries';

const retratosTranslated = (en: boolean, pt: boolean) =>
  allFacets().map((facet) => (facet.slug === 'retratos' ? { ...facet, translations: { es: true, en, pt } } : facet));

describe('ListSitemapEntries', () => {
  it('lists only Spanish pages while nothing is translated', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository()).execute();

    expect(entries.map((entry) => entry.path)).toContain('/retratos');
    expect(entries.filter((entry) => entry.path.startsWith('/en') || entry.path.startsWith('/pt'))).toEqual([]);
    expect(entries.find((entry) => entry.path === '/retratos')?.alternates).toEqual({ es: '/retratos', 'x-default': '/retratos' });
  });

  it('lists an English page with its alternates once Lara translates it', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository({ facets: retratosTranslated(true, false) })).execute();

    expect(entries).toContainEqual({
      path: '/en/portraits',
      alternates: { es: '/retratos', en: '/en/portraits', 'x-default': '/en/portraits' },
    });
    expect(entries.find((entry) => entry.path === '/pt/retratos')).toBeUndefined();
  });

  it('uses the Spanish page as x-default when English is missing', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository({ facets: retratosTranslated(false, true) })).execute();

    expect(entries).toContainEqual({
      path: '/pt/retratos',
      alternates: { es: '/retratos', pt: '/pt/retratos', 'x-default': '/retratos' },
    });
  });

  it('uses the series slug of each language', async () => {
    const [first, ...rest] = allSeries();
    const translated = { ...first!, slugs: { es: 'oficios', en: 'trades', pt: 'oficios' }, translations: { es: true, en: true, pt: false } };
    const entries = await new ListSitemapEntries(new FakeContentRepository({ series: [translated, ...rest] })).execute();

    expect(entries).toContainEqual({
      path: '/en/work/trades',
      alternates: { es: '/obra/oficios', en: '/en/work/trades', 'x-default': '/en/work/trades' },
    });
  });

  it('skips the brands facet because the brands page has its own content', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository()).execute();

    expect(entries.filter((entry) => entry.path === '/marcas')).toHaveLength(1);
  });
});
