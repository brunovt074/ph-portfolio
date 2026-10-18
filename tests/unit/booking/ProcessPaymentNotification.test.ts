import { describe, expect, it, vi } from 'vitest';
import { aBookingWorld, aSlotWorld, THURSDAY_MORNING_SLOT } from '../../fixtures/aBookingWorld';
import { aBooking, aSlotBooking } from '../../fixtures/aBooking';
import { aCreateBookingInput } from '../../fixtures/aCreateBookingInput';
import { aGatewayPayment } from '../../fixtures/aGatewayPayment';
import { aPayment } from '../../fixtures/aPayment';
import { InProcessBookingLock } from '@/infrastructure/scheduling/InProcessBookingLock';
import { FakePaymentGateway } from '../../fakes/FakePaymentGateway';
import { RecordingNotifier } from '../../fakes/RecordingNotifier';

const notification = (paymentId?: string) => ({ headers: {}, query: {}, body: paymentId === undefined ? null : { paymentId } });

const worldWithPendingDeposit = async (options: Parameters<typeof aBookingWorld>[0] = {}) => {
  const world = aBookingWorld(options);
  await world.bookings.create(aBooking());
  await world.payments.create(aPayment());
  return world;
};

describe('ProcessPaymentNotification', () => {
  it('an approved deposit confirms the booking and tells the studio and the client', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment());

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'updated' } });
    expect((await world.bookings.findById('booking-1'))?.status).toBe('confirmed');
    expect(await world.payments.findById('payment-1')).toMatchObject({ status: 'approved', externalPaymentId: 'ext-1', raw: { id: 'ext-1' } });
    expect(world.notifier.confirmed.map((booking) => booking.id)).toEqual(['booking-1']);
  });

  it('a repeated webhook does not send two emails', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment());

    await world.processNotification.execute('fake', notification('ext-1'));
    const second = await world.processNotification.execute('fake', notification('ext-1'));

    expect(second).toEqual({ ok: true, value: { outcome: 'unchanged' } });
    expect(world.notifier.confirmed).toHaveLength(1);
  });

  it('a payment approved for less money does not confirm the booking and is reported without personal data', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment({ amountCents: 100_000 }));

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'amount_mismatch' } });
    expect((await world.bookings.findById('booking-1'))?.status).toBe('awaiting_payment');
    expect((await world.payments.findById('payment-1'))?.status).toBe('rejected');
    expect(world.reporter.reported.map((error) => error.message)).toEqual(['[payments] amount mismatch payment-1']);
    expect(world.notifier.confirmed).toEqual([]);
  });

  it('a repeated mismatched webhook is not reported twice', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment({ amountCents: 100_000 }));

    await world.processNotification.execute('fake', notification('ext-1'));
    const second = await world.processNotification.execute('fake', notification('ext-1'));

    expect(second).toEqual({ ok: true, value: { outcome: 'unchanged' } });
    expect(world.reporter.reported).toHaveLength(1);
  });

  it('a payment in dollars does not confirm the booking', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment({ currency: 'USD' }));

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'amount_mismatch' } });
    expect((await world.bookings.findById('booking-1'))?.status).toBe('awaiting_payment');
  });

  it('the payment arrives after the hold expired and the booking is confirmed anyway', async () => {
    const world = await worldWithPendingDeposit();
    world.clock.advanceHours(72);
    world.gateway.hasRemotePayment(aGatewayPayment());

    await world.processNotification.execute('fake', notification('ext-1'));

    expect((await world.bookings.findById('booking-1'))?.status).toBe('confirmed');
  });

  it('if the email fails the booking stays confirmed and the error is reported', async () => {
    const world = await worldWithPendingDeposit({ notifier: new RecordingNotifier(new Error('resend down')) });
    world.gateway.hasRemotePayment(aGatewayPayment());

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'updated' } });
    expect((await world.bookings.findById('booking-1'))?.status).toBe('confirmed');
    expect(world.reporter.reported.map((error) => error.message)).toEqual(['resend down']);
  });

  it('a rejected payment keeps the booking waiting for a new attempt', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment({ status: 'rejected' }));

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'updated' } });
    expect((await world.bookings.findById('booking-1'))?.status).toBe('awaiting_payment');
    expect(world.notifier.confirmed).toEqual([]);
  });

  it('an approved balance payment does not trigger the deposit confirmation', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking());
    await world.payments.create(aPayment({ kind: 'balance' }));
    world.gateway.hasRemotePayment(aGatewayPayment());

    await world.processNotification.execute('fake', notification('ext-1'));

    expect((await world.bookings.findById('booking-1'))?.status).toBe('awaiting_payment');
    expect(world.notifier.confirmed).toEqual([]);
  });

  it.each(['confirmed', 'needs_rescheduling', 'cancelled'] as const)(
    'a client pays again for a %s booking: nothing changes and Lara is warned to review a refund',
    async (status) => {
      const world = aBookingWorld();
      await world.bookings.create(aBooking({ status }));
      await world.payments.create(aPayment({ id: 'payment-2', externalPaymentId: null }));
      world.gateway.hasRemotePayment(aGatewayPayment({ reference: 'payment-2' }));

      const result = await world.processNotification.execute('fake', notification('ext-1'));

      expect(result).toEqual({ ok: true, value: { outcome: 'duplicate' } });
      expect((await world.bookings.findById('booking-1'))?.status).toBe(status);
      expect(world.notifier.confirmed).toEqual([]);
      expect(world.notifier.duplicates.map((booking) => booking.id)).toEqual(['booking-1']);
      expect(world.reporter.reported.map((error) => error.message)).toEqual(['[payments] duplicate payment payment-2']);
    },
  );

  it('the client retries the checkout and both payments get approved: the second one is flagged, not confirmed again', async () => {
    const world = await worldWithPendingDeposit();
    await world.payments.create(aPayment({ id: 'payment-2' }));
    world.gateway.hasRemotePayment(aGatewayPayment());
    world.gateway.hasRemotePayment(aGatewayPayment({ externalPaymentId: 'ext-2', reference: 'payment-2' }));

    const first = await world.processNotification.execute('fake', notification('ext-1'));
    const second = await world.processNotification.execute('fake', notification('ext-2'));

    expect(first).toEqual({ ok: true, value: { outcome: 'updated' } });
    expect(second).toEqual({ ok: true, value: { outcome: 'duplicate' } });
    expect(world.notifier.confirmed).toHaveLength(1);
    expect(world.notifier.duplicates).toHaveLength(1);
  });

  it('if the warning about the second payment cannot be emailed the failure is reported too', async () => {
    const world = aBookingWorld({ notifier: new RecordingNotifier(new Error('resend down')) });
    await world.bookings.create(aBooking({ status: 'confirmed' }));
    await world.payments.create(aPayment());
    world.gateway.hasRemotePayment(aGatewayPayment());

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'duplicate' } });
    expect(world.reporter.reported.map((error) => error.message)).toEqual(['[payments] duplicate payment payment-1', 'resend down']);
  });

  it('Mercado Pago refunds a confirmed deposit: Lara is told and the booking and the calendar stay untouched', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment());
    await world.processNotification.execute('fake', notification('ext-1'));
    world.gateway.hasRemotePayment(aGatewayPayment({ status: 'refunded' }));

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'updated' } });
    expect((await world.payments.findById('payment-1'))?.status).toBe('refunded');
    expect((await world.bookings.findById('booking-1'))?.status).toBe('confirmed');
    expect(world.notifier.refunds.map((booking) => booking.id)).toEqual(['booking-1']);
    expect(world.reporter.reported).toEqual([]);
  });

  it('a repeated refund notice does not warn Lara twice', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment());
    await world.processNotification.execute('fake', notification('ext-1'));
    world.gateway.hasRemotePayment(aGatewayPayment({ status: 'refunded' }));

    await world.processNotification.execute('fake', notification('ext-1'));
    const second = await world.processNotification.execute('fake', notification('ext-1'));

    expect(second).toEqual({ ok: true, value: { outcome: 'unchanged' } });
    expect(world.notifier.refunds).toHaveLength(1);
  });

  it('a payment that was never approved and is then refunded does not warn Lara', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment({ status: 'refunded' }));

    await world.processNotification.execute('fake', notification('ext-1'));

    expect(world.notifier.refunds).toEqual([]);
  });

  it('a refunded balance payment does not warn about the booking deposit', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ status: 'confirmed' }));
    await world.payments.create(aPayment({ kind: 'balance', status: 'approved', externalPaymentId: 'ext-1' }));
    world.gateway.hasRemotePayment(aGatewayPayment({ status: 'refunded' }));

    await world.processNotification.execute('fake', notification('ext-1'));

    expect(world.notifier.refunds).toEqual([]);
  });

  it('a refund of a payment whose booking is gone warns nobody', async () => {
    const world = aBookingWorld();
    await world.payments.create(aPayment({ status: 'approved', externalPaymentId: 'ext-1' }));
    world.gateway.hasRemotePayment(aGatewayPayment({ status: 'refunded' }));

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'updated' } });
    expect(world.notifier.refunds).toEqual([]);
  });

  it('if the refund email fails the failure is reported', async () => {
    const world = aBookingWorld({ notifier: new RecordingNotifier(new Error('resend down')) });
    await world.bookings.create(aBooking({ status: 'confirmed' }));
    await world.payments.create(aPayment({ status: 'approved', externalPaymentId: 'ext-1' }));
    world.gateway.hasRemotePayment(aGatewayPayment({ status: 'refunded' }));

    await world.processNotification.execute('fake', notification('ext-1'));

    expect(world.reporter.reported.map((error) => error.message)).toEqual(['resend down']);
  });

  it('an approved deposit whose booking no longer exists sends nothing', async () => {
    const world = aBookingWorld();
    await world.payments.create(aPayment());
    world.gateway.hasRemotePayment(aGatewayPayment());

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'updated' } });
    expect(world.notifier.confirmed).toEqual([]);
  });

  it('a notification for a payment we never created is ignored', async () => {
    const world = aBookingWorld();
    world.gateway.hasRemotePayment(aGatewayPayment({ reference: 'someone-else' }));

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'ignored' } });
  });

  it('a notification from another provider about one of our payments is ignored', async () => {
    const other = new FakePaymentGateway('other');
    const world = await worldWithPendingDeposit({ gateways: [new FakePaymentGateway('fake'), other] });
    other.hasRemotePayment(aGatewayPayment());

    const result = await world.processNotification.execute('other', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'ignored' } });
    expect((await world.payments.findById('payment-1'))?.status).toBe('pending');
  });

  it('an unknown provider is refused', async () => {
    const result = await aBookingWorld().processNotification.execute('pix', notification('ext-1'));

    expect(result).toEqual({ ok: false, error: 'unknown_provider' });
  });

  it('a notification the gateway cannot authenticate is refused', async () => {
    const result = await aBookingWorld().processNotification.execute('fake', notification());

    expect(result).toEqual({ ok: false, error: 'invalid_notification' });
  });

  it('an approved full payment confirms the booking just like a deposit', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ paymentPlan: 'full' }));
    await world.payments.create(aPayment({ kind: 'full', amountCents: 9_500_000 }));
    world.gateway.hasRemotePayment(aGatewayPayment({ amountCents: 9_500_000 }));

    await world.processNotification.execute('fake', notification('ext-1'));

    expect((await world.bookings.findById('booking-1'))?.status).toBe('confirmed');
    expect(world.notifier.confirmed).toHaveLength(1);
  });

  it('a full payment approved for less money than the total does not confirm', async () => {
    const world = aBookingWorld();
    await world.bookings.create(aBooking({ paymentPlan: 'full' }));
    await world.payments.create(aPayment({ kind: 'full', amountCents: 9_500_000 }));
    world.gateway.hasRemotePayment(aGatewayPayment({ amountCents: 4_750_000 }));

    const result = await world.processNotification.execute('fake', notification('ext-1'));

    expect(result).toEqual({ ok: true, value: { outcome: 'amount_mismatch' } });
    expect((await world.bookings.findById('booking-1'))?.status).toBe('awaiting_payment');
  });

  it('Mercado Pago announces the same payment twice at the same time and only one event and one email are created', async () => {
    const world = aSlotWorld({}, new InProcessBookingLock());
    const created = await world.createBooking.execute(aCreateBookingInput({ slotStart: THURSDAY_MORNING_SLOT }));
    const payment = world.payments.all().at(-1);
    if (!created.ok || !payment) {
      throw new Error('setup failed');
    }
    world.gateway.hasRemotePayment(aGatewayPayment({ reference: payment.id, amountCents: payment.amountCents }));
    const release = world.gateway.holdsFetchesUntilReleased();

    const both = Promise.all([
      world.processNotification.execute('fake', notification('ext-1')),
      world.processNotification.execute('fake', notification('ext-1')),
    ]);
    release();
    const results = await both;

    expect(results.map((result) => (result.ok ? result.value.outcome : result.error)).sort()).toEqual(['unchanged', 'updated']);
    expect(world.calendar?.events).toHaveLength(1);
    expect(world.notifier.confirmed).toHaveLength(1);
    expect(world.notifier.duplicates).toEqual([]);
  });

  it('Postgres fails right after the payment was stored as approved and the webhook retry still confirms the booking', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment());
    vi.spyOn(world.bookings, 'transition').mockRejectedValueOnce(new Error('db down'));

    await expect(world.processNotification.execute('fake', notification('ext-1'))).rejects.toThrow('db down');
    expect((await world.payments.findById('payment-1'))?.status).toBe('approved');
    const retry = await world.processNotification.execute('fake', notification('ext-1'));

    expect(retry).toEqual({ ok: true, value: { outcome: 'updated' } });
    expect((await world.bookings.findById('booking-1'))?.status).toBe('confirmed');
    expect(world.notifier.confirmed).toHaveLength(1);
  });

  it('two instances receive the same approved webhook without a shared lock and the client gets one email', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment());
    const release = world.gateway.holdsFetchesUntilReleased();

    const both = Promise.all([world.processNotification.execute('fake', notification('ext-1')), world.processNotification.execute('fake', notification('ext-1'))]);
    release();
    const results = await both;

    expect(results.map((result) => (result.ok ? result.value.outcome : result.error)).sort()).toEqual(['unchanged', 'updated']);
    expect(world.notifier.confirmed).toHaveLength(1);
    expect(world.notifier.duplicates).toEqual([]);
  });

  it('a late notice about a failed attempt does not overwrite the approved payment', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment({ externalPaymentId: 'ext-2' }));
    await world.processNotification.execute('fake', notification('ext-2'));
    world.gateway.hasRemotePayment(aGatewayPayment({ externalPaymentId: 'ext-1', status: 'rejected' }));
    world.gateway.hasRemotePayment(aGatewayPayment({ externalPaymentId: 'ext-3', status: 'pending' }));
    world.gateway.hasRemotePayment(aGatewayPayment({ externalPaymentId: 'ext-4', status: 'refunded' }));

    const results = await Promise.all(['ext-1', 'ext-3', 'ext-4'].map((id) => world.processNotification.execute('fake', notification(id))));

    expect(results.map((result) => (result.ok ? result.value.outcome : result.error))).toEqual(['unchanged', 'unchanged', 'unchanged']);
    expect(await world.payments.findById('payment-1')).toMatchObject({ status: 'approved', externalPaymentId: 'ext-2' });
    expect(world.notifier.duplicates).toEqual([]);
    expect(world.notifier.refunds).toEqual([]);
  });

  it('an approved payment can still be refunded under the same external id', async () => {
    const world = await worldWithPendingDeposit();
    world.gateway.hasRemotePayment(aGatewayPayment());
    await world.processNotification.execute('fake', notification('ext-1'));
    world.gateway.hasRemotePayment(aGatewayPayment({ status: 'pending' }));

    const stale = await world.processNotification.execute('fake', notification('ext-1'));

    expect(stale).toEqual({ ok: true, value: { outcome: 'unchanged' } });
    expect((await world.payments.findById('payment-1'))?.status).toBe('approved');
  });

  it('a notification that is not about a payment is acknowledged without fetching anything', async () => {
    const world = await worldWithPendingDeposit();

    const result = await world.processNotification.execute('fake', { headers: {}, query: {}, body: { ignore: true } });

    expect(result).toEqual({ ok: true, value: { outcome: 'ignored' } });
    expect(world.reporter.reported).toEqual([]);
  });

  it('a notification with a rejected signature is refused and logged without personal data', async () => {
    const world = await worldWithPendingDeposit();

    const result = await world.processNotification.execute('fake', notification());

    expect(result).toEqual({ ok: false, error: 'invalid_notification' });
    expect(world.reporter.reported.map((error) => error.message)).toEqual(['[payments] rejected webhook signature']);
  });

  it('a notification for an unknown provider is refused', async () => {
    const world = await worldWithPendingDeposit();

    expect(await world.processNotification.execute('pix', notification('ext-1'))).toEqual({ ok: false, error: 'unknown_provider' });
  });

  describe('turns', () => {
    const slotInput = () => aCreateBookingInput({ slotStart: THURSDAY_MORNING_SLOT });

    const bookAndPay = async (world: ReturnType<typeof aSlotWorld>, input = slotInput()) => {
      const created = await world.createBooking.execute(input);
      if (!created.ok) {
        throw new Error(created.error);
      }
      const payment = world.payments.all().at(-1);
      if (!payment) {
        throw new Error('no payment');
      }
      world.gateway.hasRemotePayment(aGatewayPayment({ externalPaymentId: `ext-${payment.id}`, reference: payment.id, amountCents: payment.amountCents }));
      return { bookingId: created.value.bookingId, notify: () => world.processNotification.execute('fake', notification(`ext-${payment.id}`)) };
    };

    it('the payment of a free turn creates the event in Lara calendar and confirms the booking', async () => {
      const world = aSlotWorld();
      const { bookingId, notify } = await bookAndPay(world);

      await notify();

      expect(world.calendar?.events).toEqual([
        {
          bookingId,
          start: new Date('2026-10-22T13:00:00Z'),
          end: new Date('2026-10-22T14:30:00Z'),
          title: 'Reserva: Maternidad — Camila Ríos',
          description: [
            'Email: camila@example.com',
            'Teléfono: +54 9 341 000 0000',
            'Plan: seña',
            'Pagado: ARS 47500',
            'Notas: Prefiero luz natural',
            `Reserva: ${bookingId}`,
          ].join('\n'),
        },
      ]);
      expect(await world.bookings.findById(bookingId)).toMatchObject({ status: 'confirmed', calendarEventId: 'event-1' });
      expect(world.notifier.confirmed).toHaveLength(1);
    });

    it('the event of a full payment says so and a booking without notes says it too', async () => {
      const world = aSlotWorld();
      const { notify } = await bookAndPay(world, aCreateBookingInput({ slotStart: THURSDAY_MORNING_SLOT, paymentPlan: 'full', notes: '' }));

      await notify();

      expect(world.calendar?.events[0]?.description).toContain('Plan: pago completo');
      expect(world.calendar?.events[0]?.description).toContain('Pagado: ARS 95000');
      expect(world.calendar?.events[0]?.description).toContain('Notas: Sin notas');
    });

    it('the payment arrives late and another client took the turn: it needs rescheduling and both are told', async () => {
      const world = aSlotWorld();
      const late = await bookAndPay(world);
      world.clock.advanceHours(1);
      const winner = await bookAndPay(world, aCreateBookingInput({ slotStart: THURSDAY_MORNING_SLOT, name: 'Julieta Paz', email: 'julieta@example.com' }));
      await winner.notify();

      await late.notify();

      expect(await world.bookings.findById(late.bookingId)).toMatchObject({ status: 'needs_rescheduling', calendarEventId: null });
      expect(await world.bookings.findById(winner.bookingId)).toMatchObject({ status: 'confirmed' });
      expect(world.notifier.conflicts.map((booking) => booking.id)).toEqual([late.bookingId]);
      expect(world.calendar?.events).toHaveLength(1);
      expect(world.payments.all().filter((payment) => payment.status === 'approved')).toHaveLength(2);
    });

    it('Lara blocks the turn in her calendar while the client is paying', async () => {
      const world = aSlotWorld();
      const { bookingId, notify } = await bookAndPay(world);
      world.calendar?.blocks({ start: new Date('2026-10-22T13:00:00Z'), end: new Date('2026-10-22T14:00:00Z') });

      await notify();

      expect((await world.bookings.findById(bookingId))?.status).toBe('needs_rescheduling');
      expect(world.notifier.conflicts).toHaveLength(1);
    });

    it('a late payment for a turn nobody took still confirms the booking', async () => {
      const world = aSlotWorld();
      const { bookingId, notify } = await bookAndPay(world);
      world.clock.advanceHours(2);

      await notify();

      expect((await world.bookings.findById(bookingId))?.status).toBe('confirmed');
    });

    it('Google down when confirming: the booking is confirmed anyway and the failure is reported', async () => {
      const world = aSlotWorld();
      const { bookingId, notify } = await bookAndPay(world);
      world.calendar?.rejectsEventCreation();

      const result = await notify();

      expect(result).toEqual({ ok: true, value: { outcome: 'updated' } });
      expect(await world.bookings.findById(bookingId)).toMatchObject({ status: 'confirmed', calendarEventId: null });
      expect(world.reporter.reported).toHaveLength(1);
      expect(world.notifier.confirmed).toHaveLength(1);
    });

    it('Google unreachable even to check the turn: the paid booking is confirmed and the failures are reported', async () => {
      const world = aSlotWorld();
      const { bookingId, notify } = await bookAndPay(world);
      world.calendar?.goesDown();

      await notify();

      expect((await world.bookings.findById(bookingId))?.status).toBe('confirmed');
      expect(world.reporter.reported).toHaveLength(2);
    });

    it('a paid turn is confirmed without event when the calendar was disconnected meanwhile', async () => {
      const world = aBookingWorld();
      await world.bookings.create(aSlotBooking());
      await world.payments.create(aPayment());
      world.gateway.hasRemotePayment(aGatewayPayment());

      await world.processNotification.execute('fake', notification('ext-1'));

      expect(await world.bookings.findById('booking-1')).toMatchObject({ status: 'confirmed', calendarEventId: null });
    });

    it('if the email about the conflict fails the booking still needs rescheduling and the error is reported', async () => {
      const world = aSlotWorld({ notifier: new RecordingNotifier(new Error('resend down')) });
      const { bookingId, notify } = await bookAndPay(world);
      world.calendar?.blocks({ start: new Date('2026-10-22T13:00:00Z'), end: new Date('2026-10-22T14:00:00Z') });

      await notify();

      expect((await world.bookings.findById(bookingId))?.status).toBe('needs_rescheduling');
      expect(world.reporter.reported.map((error) => error.message)).toEqual(['resend down']);
    });

    it('Sanity fails right after the turn payment was stored and the webhook retry confirms the booking with its event', async () => {
      const world = aSlotWorld();
      const { bookingId, notify } = await bookAndPay(world);
      vi.spyOn(world.content, 'getSchedulingSettings').mockRejectedValueOnce(new Error('sanity down'));

      await expect(notify()).rejects.toThrow('sanity down');
      await notify();

      expect(await world.bookings.findById(bookingId)).toMatchObject({ status: 'confirmed', calendarEventId: 'event-1' });
      expect(world.notifier.confirmed).toHaveLength(1);
      expect(world.calendar?.events).toHaveLength(1);
    });

    it('a late payment with Google down cannot take a turn that another client already paid for', async () => {
      const world = aSlotWorld();
      const late = await bookAndPay(world);
      world.clock.advanceHours(1);
      const winner = await bookAndPay(world, aCreateBookingInput({ slotStart: THURSDAY_MORNING_SLOT, name: 'Julieta Paz', email: 'julieta@example.com' }));
      await winner.notify();
      world.calendar?.goesDown();

      await late.notify();

      expect(await world.bookings.findById(late.bookingId)).toMatchObject({ status: 'needs_rescheduling', calendarEventId: null });
      expect(world.notifier.conflicts.map((booking) => booking.id)).toEqual([late.bookingId]);
      expect(world.notifier.confirmed).toHaveLength(1);
    });

    it('if the event id cannot be saved the client is still told and the failure is reported', async () => {
      const world = aSlotWorld();
      const { bookingId, notify } = await bookAndPay(world);
      vi.spyOn(world.bookings, 'update').mockRejectedValueOnce(new Error('db down'));

      await notify();

      expect((await world.bookings.findById(bookingId))?.status).toBe('confirmed');
      expect(world.notifier.confirmed).toHaveLength(1);
      expect(world.reporter.reported.map((error) => error.message)).toEqual(['db down']);
    });

    it('a session booked by proposed date never touches the calendar', async () => {
      const world = aSlotWorld();
      await world.bookings.create(aBooking());
      await world.payments.create(aPayment());
      world.gateway.hasRemotePayment(aGatewayPayment());

      await world.processNotification.execute('fake', notification('ext-1'));

      expect(world.calendar?.events).toEqual([]);
      expect((await world.bookings.findById('booking-1'))?.status).toBe('confirmed');
    });
  });
});
