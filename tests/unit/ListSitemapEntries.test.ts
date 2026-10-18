import { describe, expect, it } from 'vitest';
import { ListSitemapEntries } from '@/application/ListSitemapEntries';
import { aBookingOffer } from '../fixtures/aBookingOffer';
import { allFacets } from '../fixtures/aFacet';
import { FakeContentRepository } from '../fakes/FakeContentRepository';

describe('ListSitemapEntries', () => {
  it('lists only Spanish pages while nothing is translated', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository()).execute();
    const paths = entries.map((entry) => entry.path);
    expect(paths).toContain('/');
    expect(paths).toContain('/marcas');
    expect(paths).toContain('/obra');
    expect(paths).toContain('/obra/copias');
    expect(paths).toContain('/obra/oficios');
    expect(paths).toContain('/reservas');
    expect(paths).not.toContain('/en/');
    expect(paths).not.toContain('/pt/obra');
  });

  it('lists an English page with its alternates once Sarah translates it', async () => {
    const repository = new FakeContentRepository({
      facets: allFacets().map((facet) => (facet.slug === 'retratos' ? { ...facet, translations: { es: true, en: true, pt: false } } : facet)),
    });
    const entries = await new ListSitemapEntries(repository).execute();
    expect(entries).toContainEqual({ path: '/en/portraits', alternates: { es: '/retratos', en: '/en/portraits', 'x-default': '/en/portraits' } });
    expect(entries.find((entry) => entry.path === '/pt/retratos')).toBeUndefined();
  });

  it('uses the Spanish page as x-default when English is missing', async () => {
    const repository = new FakeContentRepository({
      facets: allFacets().map((facet) => (facet.slug === 'retratos' ? { ...facet, translations: { es: true, en: false, pt: true } } : facet)),
    });
    const entries = await new ListSitemapEntries(repository).execute();
    expect(entries).toContainEqual({ path: '/pt/retratos', alternates: { es: '/retratos', pt: '/pt/retratos', 'x-default': '/retratos' } });
  });

  it('keeps the bookings page Spanish only when no offers are translated', async () => {
    const entries = await new ListSitemapEntries(new FakeContentRepository({ bookingOffers: [] })).execute();
    expect(entries.map((entry) => entry.path)).toContain('/reservas');
    expect(entries.map((entry) => entry.path)).not.toContain('/en/bookings');
  });

  it('lists translated booking pages once the offers are translated', async () => {
    const repository = new FakeContentRepository({
      bookingOffers: [aBookingOffer({ translations: { es: true, en: true, pt: true } })],
    });
    const entries = await new ListSitemapEntries(repository).execute();
    expect(entries).toContainEqual({ path: '/en/bookings', alternates: { es: '/reservas', en: '/en/bookings', pt: '/pt/reservas', 'x-default': '/en/bookings' } });
  });
});
