import { describe, expect, it } from 'vitest';
import { ListBookingOffers } from '@/application/booking/ListBookingOffers';
import { aSchedulingSettings, tuesdayAndThursdayWindows } from '../../fixtures/aSchedulingSettings';
import { FakeCalendarProvider } from '../../fakes/FakeCalendarProvider';
import { FakeContentRepository } from '../../fakes/FakeContentRepository';
import { aBookingOffer } from '../../fixtures/aBookingOffer';

describe('ListBookingOffers', () => {
  it('shows a priced session with the half deposit the client will pay online', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: 9_500_000 })] });

    const {
      offers: [offer],
    } = await new ListBookingOffers(content, null).execute('es');

    expect(offer).toEqual({
      slug: 'maternidad',
      title: 'Maternidad',
      description: 'La espera, en clave íntima y sin apuro.',
      totalCents: 9_500_000,
      depositCents: 4_750_000,
      depositPercent: 50,
      durationMinutes: null,
      fullPaymentAvailable: true,
      scheduling: 'request',
      bookable: true,
    });
  });

  it('rounds the deposit to a whole peso', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: 8_500_100, depositPercent: 33 })] });

    const {
      offers: [offer],
    } = await new ListBookingOffers(content, null).execute('es');

    expect(offer?.depositCents).toBe(2_805_000);
  });

  it('shows a session without price as not bookable and without deposit', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: null })] });

    const {
      offers: [offer],
    } = await new ListBookingOffers(content, null).execute('es');

    expect(offer).toMatchObject({ totalCents: null, depositCents: null, bookable: false });
  });

  it('does not allow booking a session priced at zero', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: 0 })] });

    const {
      offers: [offer],
    } = await new ListBookingOffers(content, null).execute('es');

    expect(offer).toMatchObject({ depositCents: null, bookable: false });
  });

  it('exposes the duration of a session that can be booked by turn', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ durationMinutes: 90 })] });

    const {
      offers: [offer],
    } = await new ListBookingOffers(content, null).execute('es');

    expect(offer?.durationMinutes).toBe(90);
  });

  it('offers turns only for a session with duration when the agenda and the weekly windows exist', async () => {
    const content = new FakeContentRepository({
      bookingOffers: [aBookingOffer({ slug: 'con-duracion', durationMinutes: 90 }), aBookingOffer({ slug: 'sin-duracion', durationMinutes: null })],
      scheduling: aSchedulingSettings({ windows: tuesdayAndThursdayWindows() }),
    });

    const { offers } = await new ListBookingOffers(content, new FakeCalendarProvider()).execute('es');

    expect(offers.map((offer) => [offer.slug, offer.scheduling])).toEqual([
      ['con-duracion', 'slots'],
      ['sin-duracion', 'request'],
    ]);
  });

  it('asks for a proposed date when there is no agenda connected', async () => {
    const content = new FakeContentRepository({
      bookingOffers: [aBookingOffer({ durationMinutes: 90 })],
      scheduling: aSchedulingSettings({ windows: tuesdayAndThursdayWindows() }),
    });

    const {
      offers: [offer],
    } = await new ListBookingOffers(content, null).execute('es');

    expect(offer?.scheduling).toBe('request');
  });

  it('reports a language as translated only when every session is translated into it', async () => {
    const content = new FakeContentRepository({
      bookingOffers: [
        aBookingOffer({ slug: 'maternidad', translations: { es: true, en: true, pt: true } }),
        aBookingOffer({ slug: 'familias', translations: { es: true, en: true, pt: false } }),
      ],
    });

    const { translations } = await new ListBookingOffers(content, null).execute('en');

    expect(translations).toEqual({ es: true, en: true, pt: false });
  });
});
