import { describe, expect, it } from 'vitest';
import { aBookingWorld } from '../../fixtures/aBookingWorld';
import { aBooking } from '../../fixtures/aBooking';
import { aGatewayPayment } from '../../fixtures/aGatewayPayment';
import { aPayment } from '../../fixtures/aPayment';

const worldWithClientBackFromCheckout = async () => {
  const world = aBookingWorld();
  await world.bookings.create(aBooking());
  await world.payments.create(aPayment());
  return world;
};

describe('ReconcileBookingReturn', () => {
  it('the client comes back before the webhook and the approved payment confirms the booking', async () => {
    const world = await worldWithClientBackFromCheckout();
    world.gateway.hasRemotePayment(aGatewayPayment());

    await world.reconcileReturn.execute('booking-1', 'ext-1');

    expect((await world.bookings.findById('booking-1'))?.status).toBe('confirmed');
    expect((await world.payments.findById('payment-1'))?.status).toBe('approved');
    expect(world.notifier.confirmed).toHaveLength(1);
  });

  it('the webhook arriving afterwards does not send a second email', async () => {
    const world = await worldWithClientBackFromCheckout();
    world.gateway.hasRemotePayment(aGatewayPayment());
    await world.reconcileReturn.execute('booking-1', 'ext-1');

    await world.processNotification.execute('fake', { headers: {}, query: {}, body: { paymentId: 'ext-1' } });

    expect(world.notifier.confirmed).toHaveLength(1);
  });

  it('a payment id that belongs to another booking is not applied', async () => {
    const world = await worldWithClientBackFromCheckout();
    await world.bookings.create(aBooking({ id: 'booking-2' }));
    await world.payments.create(aPayment({ id: 'payment-2', bookingId: 'booking-2' }));
    world.gateway.hasRemotePayment(aGatewayPayment({ reference: 'payment-2' }));

    await world.reconcileReturn.execute('booking-1', 'ext-1');

    expect((await world.bookings.findById('booking-2'))?.status).toBe('awaiting_payment');
    expect((await world.bookings.findById('booking-1'))?.status).toBe('awaiting_payment');
    expect((await world.payments.findById('payment-2'))?.status).toBe('pending');
  });

  it('a payment id the gateway does not know is reported and the page still renders', async () => {
    const world = await worldWithClientBackFromCheckout();

    await world.reconcileReturn.execute('booking-1', 'ext-404');

    expect(world.reporter.reported.map((error) => error.message)).toEqual(['unknown payment ext-404']);
    expect((await world.bookings.findById('booking-1'))?.status).toBe('awaiting_payment');
  });

  it('does not call the gateway for a booking that is unknown or already settled', async () => {
    const world = await worldWithClientBackFromCheckout();
    await world.bookings.update(aBooking({ status: 'confirmed' }));

    await world.reconcileReturn.execute('booking-1', 'ext-404');
    await world.reconcileReturn.execute('missing', 'ext-404');

    expect(world.reporter.reported).toEqual([]);
  });

  it('does nothing for a booking that has no payment attempt or whose provider is gone', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking());
    await world.reconcileReturn.execute('booking-1', 'ext-404');
    await world.payments.create(aPayment({ provider: 'pix' }));

    await world.reconcileReturn.execute('booking-1', 'ext-404');

    expect(world.reporter.reported).toEqual([]);
  });
});
