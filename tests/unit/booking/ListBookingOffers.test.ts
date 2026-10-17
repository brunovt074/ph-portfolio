import { describe, expect, it } from 'vitest';
import { ListBookingOffers } from '@/application/booking/ListBookingOffers';
import { FakeContentRepository } from '../../fakes/FakeContentRepository';
import { aBookingOffer } from '../../fixtures/aBookingOffer';

describe('ListBookingOffers', () => {
  it('shows a priced session with the half deposit the client will pay online', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: 9_500_000 })] });

    const [offer] = await new ListBookingOffers(content).execute();

    expect(offer).toEqual({
      slug: 'maternidad',
      title: 'Maternidad',
      description: 'La espera, en clave íntima y sin apuro.',
      totalCents: 9_500_000,
      depositCents: 4_750_000,
      depositPercent: 50,
      durationMinutes: null,
      fullPaymentAvailable: true,
      bookable: true,
    });
  });

  it('rounds the deposit to a whole peso', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: 8_500_100, depositPercent: 33 })] });

    const [offer] = await new ListBookingOffers(content).execute();

    expect(offer?.depositCents).toBe(2_805_000);
  });

  it('shows a session without price as not bookable and without deposit', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: null })] });

    const [offer] = await new ListBookingOffers(content).execute();

    expect(offer).toMatchObject({ totalCents: null, depositCents: null, bookable: false });
  });

  it('does not allow booking a session priced at zero', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ priceCents: 0 })] });

    const [offer] = await new ListBookingOffers(content).execute();

    expect(offer).toMatchObject({ depositCents: null, bookable: false });
  });

  it('exposes the duration of a session that can be booked by turn', async () => {
    const content = new FakeContentRepository({ bookingOffers: [aBookingOffer({ durationMinutes: 90 })] });

    const [offer] = await new ListBookingOffers(content).execute();

    expect(offer?.durationMinutes).toBe(90);
  });
});
