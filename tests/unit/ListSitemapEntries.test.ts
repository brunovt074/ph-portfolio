import { describe, expect, it } from 'vitest';
import { ListSitemapEntries } from '@/application/ListSitemapEntries';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { allFacets } from '../fixtures/aFacet';
import { aBookingOffer } from '../fixtures/aBookingOffer';
import { allSeries } from '../fixtures/aSeries';

const retratosTranslated = (en: boolean, pt: boolean) =>
  allFacets().map((facet) => (facet.slug === 'retratos' ? { ...facet, translations: { es: true, en, pt } } : facet));

describe('ListSitemapEntries', () => {
  it('lists only Spanish pages while nothing is translated', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository()).execute();

    expect(entries.map((entry) => entry.path)).toContain('/es/retratos');
    expect(entries.filter((entry) => entry.path.startsWith('/en') || entry.path.startsWith('/pt'))).toEqual([]);
    expect(entries.find((entry) => entry.path === '/es/retratos')?.alternates).toEqual({ es: '/es/retratos', 'x-default': '/es/retratos' });
  });

  it.skip('lists an English page with its alternates once the photographer translates it', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository({ facets: retratosTranslated(true, false) })).execute();

    expect(entries).toContainEqual({
      path: '/en/portraits',
      alternates: { es: '/es/retratos', en: '/en/portraits', 'x-default': '/en/portraits' },
    });
    expect(entries.find((entry) => entry.path === '/pt/retratos')).toBeUndefined();
  });

  it.skip('uses the Spanish page as x-default when English is missing', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository({ facets: retratosTranslated(false, true) })).execute();

    expect(entries).toContainEqual({
      path: '/pt/retratos',
      alternates: { es: '/es/retratos', pt: '/pt/retratos', 'x-default': '/es/retratos' },
    });
  });

  it.skip('uses the series slug of each language', async () => {
    const [first, ...rest] = allSeries();
    const translated = { ...first!, slugs: { es: 'oficios', en: 'trades', pt: 'oficios' }, translations: { es: true, en: true, pt: false } };
    const entries = await new ListSitemapEntries(new FakeContentRepository({ series: [translated, ...rest] })).execute();

    expect(entries).toContainEqual({
      path: '/en/work/trades',
      alternates: { es: '/es/obra/oficios', en: '/en/work/trades', 'x-default': '/en/work/trades' },
    });
  });

  it('skips the brands facet because the brands page has its own content', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository()).execute();

    expect(entries.filter((entry) => entry.path === '/es/marcas')).toHaveLength(1);
  });

  it.skip('lists the bookings page in Spanish and adds a language only when every offer is translated', async () => {
    const spanishOnly = await new ListSitemapEntries(new FakeContentRepository()).execute();
    const translated = aBookingOffer({ translations: { es: true, en: true, pt: false } });
    const mixed = aBookingOffer({ slug: 'familia', translations: { es: true, en: false, pt: false } });
    const english = await new ListSitemapEntries(new FakeContentRepository({ bookingOffers: [translated] })).execute();
    const partial = await new ListSitemapEntries(new FakeContentRepository({ bookingOffers: [translated, mixed] })).execute();

    expect(spanishOnly.map((entry) => entry.path)).toContain('/es/reservas');
    expect(english).toContainEqual({ path: '/en/bookings', alternates: { es: '/es/reservas', en: '/en/bookings', 'x-default': '/en/bookings' } });
    expect(partial.map((entry) => entry.path)).not.toContain('/en/bookings');
  });
});
