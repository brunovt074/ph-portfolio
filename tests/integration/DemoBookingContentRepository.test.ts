import { describe, expect, it } from 'vitest';
import demoData from '../../assets/booking-demo.json';
import { DemoBookingContentRepository } from '@/infrastructure/seed/DemoBookingContentRepository';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { aBookingOffer } from '../fixtures/aBookingOffer';
import { aSchedulingSettings } from '../fixtures/aSchedulingSettings';

const noDemo = { prices: {}, durations: {}, windows: [] };

describe('DemoBookingContentRepository', () => {
  it('fills the unpriced sessions with the demo prices and durations so a demo shows the full booking flow', async () => {
    const unpriced = ['retrato-personal', 'maternidad', 'familias', 'marca-personal'].map((slug) => aBookingOffer({ slug, priceCents: null, durationMinutes: null }));
    const repository = new DemoBookingContentRepository(new FakeContentRepository({ bookingOffers: unpriced }), demoData);

    const offers = await repository.getBookingOffers('es');

    expect(offers.map((offer) => [offer.slug, offer.priceCents, offer.durationMinutes])).toEqual([
      ['retrato-personal', 8_500_000, 90],
      ['maternidad', 9_500_000, 90],
      ['familias', 11_000_000, 120],
      ['marca-personal', 12_000_000, 120],
    ]);
  });

  it('never overrides a price or a duration the photographer loaded in the CMS', async () => {
    const inner = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: 7_000_000, durationMinutes: 60 })] });

    const [offer] = await new DemoBookingContentRepository(inner, { ...noDemo, prices: { maternidad: 95_000 }, durations: { maternidad: 90 } }).getBookingOffers('es');

    expect(offer).toMatchObject({ priceCents: 7_000_000, durationMinutes: 60 });
  });

  it('leaves a session without demo data unpriced and without duration', async () => {
    const inner = new FakeContentRepository({ bookingOffers: [aBookingOffer({ slug: 'bodas', priceCents: null })] });

    const [offer] = await new DemoBookingContentRepository(inner, { ...noDemo, prices: { maternidad: 95_000 } }).getBookingOffers('es');

    expect(offer).toMatchObject({ priceCents: null, durationMinutes: null });
  });

  it('offers the demo weekly windows while the photographer has not loaded any', async () => {
    const inner = new FakeContentRepository({ scheduling: aSchedulingSettings({ windows: [] }) });
    const settings = await new DemoBookingContentRepository(inner, demoData).getSchedulingSettings();

    expect(settings.windows).toHaveLength(5);
    expect(settings.windows[0]).toEqual({ weekday: 2, from: '10:00', to: '13:00' });
  });

  it('never overrides the windows the photographer loaded in the CMS', async () => {
    const windows = [{ weekday: 1 as const, from: '08:00', to: '12:00' }];
    const inner = new FakeContentRepository({ scheduling: aSchedulingSettings({ windows }) });

    const settings = await new DemoBookingContentRepository(inner, demoData).getSchedulingSettings();

    expect(settings.windows).toEqual(windows);
  });

  it('delegates all the other content untouched', async () => {
    const inner = new FakeContentRepository();
    const repository = new DemoBookingContentRepository(inner, noDemo);

    expect(await repository.getSettings('es')).toBe(await inner.getSettings('es'));
    expect(await repository.getHome('es')).toBe(await inner.getHome('es'));
    expect(await repository.getFacets('es')).toBe(await inner.getFacets('es'));
    expect(await repository.getBrands('es')).toBe(await inner.getBrands('es'));
    expect(await repository.getObra('es')).toBe(await inner.getObra('es'));
    expect(await repository.getSeries('es')).toBe(await inner.getSeries('es'));
    expect(await repository.getPrints('es')).toBe(await inner.getPrints('es'));
    expect(await repository.getPrintsContent('es')).toBe(await inner.getPrintsContent('es'));
    expect(await repository.getTexts('pt')).toBe(await inner.getTexts('pt'));
  });
});
