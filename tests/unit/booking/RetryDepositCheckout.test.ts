import { describe, expect, it } from 'vitest';
import { aBookingWorld } from '../../fixtures/aBookingWorld';
import { aBooking, aSlotBooking } from '../../fixtures/aBooking';
import { aPayment } from '../../fixtures/aPayment';

describe('RetryDepositCheckout', () => {
  it('a client whose card was rejected gets a fresh link for the same deposit', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking());
    await world.payments.create(aPayment({ status: 'rejected', externalPaymentId: 'ext-1' }));

    const result = await world.retryCheckout.execute('booking-1');

    expect(result).toEqual({ ok: true, value: { checkoutUrl: 'https://pay.example/checkout-1' } });
    expect(world.gateway.requests[0]).toMatchObject({
      reference: 'id-1',
      amountCents: 4_750_000,
      title: 'Seña — Maternidad',
      returnUrl: 'https://sarahmoreau.example/reservas/booking-1',
      notificationUrl: 'https://sarahmoreau.example/api/payments/webhook/fake',
    });
    expect((await world.payments.findLatestForBooking('booking-1', 'deposit'))?.id).toBe('id-1');
  });

  it('an unknown booking cannot be retried', async () => {
    expect(await aBookingWorld().retryCheckout.execute('nope')).toEqual({ ok: false, error: 'not_found' });
  });

  it('an expired booking does not allow retrying', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking());
    world.clock.advanceHours(49);

    expect(await world.retryCheckout.execute('booking-1')).toEqual({ ok: false, error: 'not_retryable' });
    expect(world.payments.all()).toEqual([]);
  });

  it('an already confirmed booking does not allow retrying', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ status: 'confirmed' }));

    expect(await world.retryCheckout.execute('booking-1')).toEqual({ ok: false, error: 'not_retryable' });
  });

  it('a retry with the payment provider down reports and creates nothing', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking());
    world.gateway.failCheckoutsWith(new Error('mp down'));

    const result = await world.retryCheckout.execute('booking-1');

    expect(result).toEqual({ ok: false, error: 'gateway_unavailable' });
    expect(world.payments.all()).toEqual([]);
    expect(world.reporter.reported).toHaveLength(1);
  });

  it('a retry without a registered default provider is unavailable', async () => {
    const world = aBookingWorld({ defaultProvider: 'pix' });
    await world.bookings.create(aBooking());

    expect(await world.retryCheckout.execute('booking-1')).toEqual({ ok: false, error: 'gateway_unavailable' });
  });

  it('a retry keeps the plan the client chose and charges the total for a full payment', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ paymentPlan: 'full' }));

    await world.retryCheckout.execute('booking-1');

    expect(world.gateway.requests[0]).toMatchObject({ title: 'Sesión completa — Maternidad', amountCents: 9_500_000 });
    expect((await world.payments.findLatestForBooking('booking-1', 'full'))?.kind).toBe('full');
  });

  it('retrying a held turn keeps the same expiry and only instant methods', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aSlotBooking());

    await world.retryCheckout.execute('booking-1');

    expect(world.gateway.requests[0]).toMatchObject({ expiresAt: new Date('2026-10-17T15:30:00Z'), instantMethodsOnly: true });
  });

  it('a turn whose hold ended cannot be retried', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aSlotBooking());
    world.clock.advanceHours(1);

    expect(await world.retryCheckout.execute('booking-1')).toEqual({ ok: false, error: 'not_retryable' });
  });
});
