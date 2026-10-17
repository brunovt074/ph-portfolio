import { describe, expect, it } from 'vitest';
import { aBookingWorld } from '../../fixtures/aBookingWorld';
import { aBooking } from '../../fixtures/aBooking';
import { aPayment } from '../../fixtures/aPayment';
import type { BookingState } from '@/application/results/BookingState';
import type { Booking } from '@/domain/booking/Booking';
import type { Payment } from '@/domain/payment/Payment';

const stateOf = async (booking: Partial<Booking>, payments: Partial<Payment>[] = [], hoursLater = 0): Promise<BookingState | 'not_found'> => {
  const world = aBookingWorld();
  await world.bookings.create(aBooking(booking));
  for (const payment of payments) {
    await world.payments.create(aPayment(payment));
  }
  world.clock.advanceHours(hoursLater);
  const result = await world.getStatus.execute('booking-1');
  return result.ok ? result.value.state : result.error;
};

describe('GetBookingStatus', () => {
  it('shows the summary with only the first name of the client', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ customer: { name: '  María Camila Ríos ', email: 'a@b.c', phone: '1' } }));

    const result = await world.getStatus.execute('booking-1');

    expect(result).toEqual({
      ok: true,
      value: {
        id: 'booking-1',
        offerSlug: 'maternidad',
        offerTitle: 'Maternidad',
        paymentPlan: 'deposit',
        schedule: { kind: 'request', preferredDate: '2026-11-20', timeSlot: 'morning' },
        totalCents: 9_500_000,
        depositCents: 4_750_000,
        paidCents: 0,
        balanceCents: 9_500_000,
        firstName: 'María',
        state: 'awaiting_payment',
        expiresAt: new Date('2026-10-19T15:00:00Z'),
      },
    });
  });

  it('an unknown booking is not found', async () => {
    expect(await aBookingWorld().getStatus.execute('nope')).toEqual({ ok: false, error: 'not_found' });
  });

  it('a paid booking shows as confirmed', async () => {
    expect(await stateOf({ status: 'confirmed' })).toBe('confirmed');
  });

  it('a cancelled booking shows as cancelled', async () => {
    expect(await stateOf({ status: 'cancelled' })).toBe('cancelled');
  });

  it('a booking past its hold shows as expired', async () => {
    expect(await stateOf({}, [aPayment()], 49)).toBe('expired');
  });

  it('a booking exactly at the end of its hold can still be paid', async () => {
    expect(await stateOf({}, [aPayment()], 48)).toBe('awaiting_payment');
  });

  it('a client who has not paid yet is awaiting payment', async () => {
    expect(await stateOf({}, [aPayment()])).toBe('awaiting_payment');
  });

  it('a booking without any payment attempt is awaiting payment', async () => {
    expect(await stateOf({})).toBe('awaiting_payment');
  });

  it('a payment being processed by the gateway shows as pending payment', async () => {
    expect(await stateOf({}, [aPayment({ externalPaymentId: 'ext-1' })])).toBe('pending_payment');
  });

  it('an approved payment whose confirmation is still in flight shows as pending payment', async () => {
    expect(await stateOf({}, [aPayment({ externalPaymentId: 'ext-1', status: 'approved' })])).toBe('pending_payment');
  });

  it('a rejected payment shows as payment rejected', async () => {
    expect(await stateOf({}, [aPayment({ externalPaymentId: 'ext-1', status: 'rejected' })])).toBe('payment_rejected');
  });

  it('a cancelled payment shows as payment rejected', async () => {
    expect(await stateOf({}, [aPayment({ status: 'cancelled' })])).toBe('payment_rejected');
  });

  it('a refunded payment on a booking still waiting for the deposit shows as awaiting payment', async () => {
    expect(await stateOf({}, [aPayment({ status: 'refunded' })])).toBe('awaiting_payment');
  });

  it('only the latest attempt counts', async () => {
    const attempts = [
      aPayment({ id: 'payment-1', status: 'rejected', externalPaymentId: 'ext-1' }),
      aPayment({ id: 'payment-2' }),
    ];

    expect(await stateOf({}, attempts)).toBe('awaiting_payment');
  });

  it('a booking whose turn was lost after paying shows as needing rescheduling', async () => {
    expect(await stateOf({ status: 'needs_rescheduling' }, [aPayment({ status: 'approved' })])).toBe('needs_rescheduling');
  });

  it('a client who paid the deposit still owes the rest of the session', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ status: 'confirmed' }));
    await world.payments.create(aPayment({ status: 'approved', externalPaymentId: 'ext-1' }));

    const result = await world.getStatus.execute('booking-1');

    expect(result.ok && result.value).toMatchObject({ paidCents: 4_750_000, balanceCents: 4_750_000, state: 'confirmed' });
  });

  it('a client who paid the whole session has no balance', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ status: 'confirmed', paymentPlan: 'full' }));
    await world.payments.create(aPayment({ kind: 'full', status: 'approved', amountCents: 9_500_000 }));

    const result = await world.getStatus.execute('booking-1');

    expect(result.ok && result.value).toMatchObject({ paymentPlan: 'full', paidCents: 9_500_000, balanceCents: 0 });
  });

  it('rejected attempts do not count as paid and an overpayment never shows a negative balance', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ status: 'confirmed' }));
    await world.payments.create(aPayment({ id: 'payment-1', status: 'rejected' }));
    await world.payments.create(aPayment({ id: 'payment-2', status: 'approved', amountCents: 12_000_000 }));

    const result = await world.getStatus.execute('booking-1');

    expect(result.ok && result.value).toMatchObject({ paidCents: 12_000_000, balanceCents: 0 });
  });

  it('a full payment plan looks at the full payment attempts to know its state', async () => {
    expect(await stateOf({ paymentPlan: 'full' }, [aPayment({ kind: 'full', status: 'rejected' })])).toBe('payment_rejected');
  });
});
