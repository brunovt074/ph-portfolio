import { describe, expect, it } from 'vitest';
import demoData from '../../assets/booking-demo.json';
import { DemoBookingContentRepository } from '@/infrastructure/seed/DemoBookingContentRepository';
import { createSeedRepository } from '@/infrastructure/seed/createSeedRepository';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { aBookingOffer } from '../fixtures/aBookingOffer';
import { aSchedulingSettings } from '../fixtures/aSchedulingSettings';

const noDemo = { prices: {}, durations: {}, windows: [] };

describe('DemoBookingContentRepository', () => {
  it('fills the unpriced sessions with the demo prices and durations so a demo shows the full booking flow', async () => {
    const repository = new DemoBookingContentRepository(createSeedRepository(), demoData);

    const offers = await repository.getBookingOffers();

    expect(offers.map((offer) => [offer.slug, offer.priceCents, offer.durationMinutes])).toEqual([
      ['retrato-personal', 8_500_000, 90],
      ['maternidad', 9_500_000, 90],
      ['familias', 11_000_000, 120],
      ['marca-personal', 12_000_000, 120],
    ]);
  });

  it('never overrides a price or a duration Lara loaded in the CMS', async () => {
    const inner = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: 7_000_000, durationMinutes: 60 })] });

    const [offer] = await new DemoBookingContentRepository(inner, { ...noDemo, prices: { maternidad: 95_000 }, durations: { maternidad: 90 } }).getBookingOffers();

    expect(offer).toMatchObject({ priceCents: 7_000_000, durationMinutes: 60 });
  });

  it('leaves a session without demo data unpriced and without duration', async () => {
    const inner = new FakeContentRepository({ bookingOffers: [aBookingOffer({ slug: 'bodas', priceCents: null })] });

    const [offer] = await new DemoBookingContentRepository(inner, { ...noDemo, prices: { maternidad: 95_000 } }).getBookingOffers();

    expect(offer).toMatchObject({ priceCents: null, durationMinutes: null });
  });

  it('offers the demo weekly windows while Lara has not loaded any', async () => {
    const settings = await new DemoBookingContentRepository(createSeedRepository(), demoData).getSchedulingSettings();

    expect(settings.windows).toHaveLength(5);
    expect(settings.windows[0]).toEqual({ weekday: 2, from: '10:00', to: '13:00' });
  });

  it('never overrides the windows Lara loaded in the CMS', async () => {
    const windows = [{ weekday: 1 as const, from: '08:00', to: '12:00' }];
    const inner = new FakeContentRepository({ scheduling: aSchedulingSettings({ windows }) });

    const settings = await new DemoBookingContentRepository(inner, demoData).getSchedulingSettings();

    expect(settings.windows).toEqual(windows);
  });

  it('delegates all the other content untouched', async () => {
    const inner = new FakeContentRepository();
    const repository = new DemoBookingContentRepository(inner, noDemo);

    expect(await repository.getSettings()).toBe(await inner.getSettings());
    expect(await repository.getHome()).toBe(await inner.getHome());
    expect(await repository.getFacets()).toBe(await inner.getFacets());
    expect(await repository.getBrands()).toBe(await inner.getBrands());
    expect(await repository.getObra()).toBe(await inner.getObra());
    expect(await repository.getSeries()).toBe(await inner.getSeries());
    expect(await repository.getPrints()).toBe(await inner.getPrints());
    expect(await repository.getPrintsContent()).toBe(await inner.getPrintsContent());
  });
});
