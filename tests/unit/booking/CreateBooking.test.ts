import { describe, expect, it } from 'vitest';
import { aBookingOffer } from '../../fixtures/aBookingOffer';
import { aBookingWorld } from '../../fixtures/aBookingWorld';
import { aCreateBookingInput } from '../../fixtures/aCreateBookingInput';
import { aSlotWorld, THURSDAY_MORNING_SLOT } from '../../fixtures/aBookingWorld';
import { FakePaymentGateway } from '../../fakes/FakePaymentGateway';

describe('CreateBooking', () => {
  it('a client books Maternidad and receives the link to pay half as deposit', async () => {
    const world = aBookingWorld();

    const result = await world.createBooking.execute(aCreateBookingInput());

    expect(result).toEqual({ ok: true, value: { bookingId: 'id-1', checkoutUrl: 'https://pay.example/checkout-1' } });
    expect(world.gateway.requests).toEqual([
      {
        reference: 'id-2',
        title: 'Seña — Maternidad',
        amountCents: 4_750_000,
        currency: 'ARS',
        payerName: 'Camila Ríos',
        payerEmail: 'camila@example.com',
        returnUrl: 'https://sarahmoreau.example/reservas/id-1',
        notificationUrl: 'https://sarahmoreau.example/api/payments/webhook/fake',
      },
    ]);
  });

  it('keeps the booking awaiting the deposit for 48 hours with a pending payment', async () => {
    const world = aBookingWorld();

    await world.createBooking.execute(aCreateBookingInput());

    expect(world.bookings.all()).toEqual([
      {
        id: 'id-1',
        offerSlug: 'maternidad',
        offerTitle: 'Maternidad',
        totalCents: 9_500_000,
        depositCents: 4_750_000,
        currency: 'ARS',
        paymentPlan: 'deposit',
        schedule: { kind: 'request', preferredDate: '2026-11-20', timeSlot: 'morning' },
        calendarEventId: null,
        customer: { name: 'Camila Ríos', email: 'camila@example.com', phone: '+54 9 341 000 0000' },
        notes: 'Prefiero luz natural',
        status: 'awaiting_payment',
        expiresAt: new Date('2026-10-19T15:00:00Z'),
        createdAt: new Date('2026-10-17T15:00:00Z'),
        updatedAt: new Date('2026-10-17T15:00:00Z'),
      },
    ]);
    expect(world.payments.all()).toEqual([
      {
        id: 'id-2',
        bookingId: 'id-1',
        kind: 'deposit',
        provider: 'fake',
        checkoutId: 'checkout-1',
        checkoutUrl: 'https://pay.example/checkout-1',
        externalPaymentId: null,
        status: 'pending',
        amountCents: 4_750_000,
        currency: 'ARS',
        raw: {},
        createdAt: new Date('2026-10-17T15:00:00Z'),
        updatedAt: new Date('2026-10-17T15:00:00Z'),
      },
    ]);
  });

  it('a session that does not exist cannot be booked', async () => {
    const result = await aBookingWorld().createBooking.execute(aCreateBookingInput({ offerSlug: 'bodas' }));

    expect(result).toEqual({ ok: false, error: 'offer_not_found' });
  });

  it('a session without price cannot be booked', async () => {
    const world = aBookingWorld({ offers: [aBookingOffer({ priceCents: null })] });

    const result = await world.createBooking.execute(aCreateBookingInput());

    expect(result).toEqual({ ok: false, error: 'offer_unavailable' });
    expect(world.bookings.all()).toEqual([]);
  });

  it('tomorrow is too soon to propose a date', async () => {
    const result = await aBookingWorld().createBooking.execute(aCreateBookingInput({ preferredDate: '2026-10-18' }));

    expect(result).toEqual({ ok: false, error: 'invalid_date' });
  });

  it('the day after tomorrow is the earliest accepted date', async () => {
    const result = await aBookingWorld().createBooking.execute(aCreateBookingInput({ preferredDate: '2026-10-19' }));

    expect(result.ok).toBe(true);
  });

  it('a date past one year ahead is rejected while the last day is accepted', async () => {
    const world = aBookingWorld();

    const tooFar = await world.createBooking.execute(aCreateBookingInput({ preferredDate: '2027-10-18' }));
    const lastDay = await world.createBooking.execute(aCreateBookingInput({ preferredDate: '2027-10-17' }));

    expect(tooFar).toEqual({ ok: false, error: 'invalid_date' });
    expect(lastDay.ok).toBe(true);
  });

  it('February 29th of a non leap year is rejected', async () => {
    const result = await aBookingWorld().createBooking.execute(aCreateBookingInput({ preferredDate: '2027-02-29' }));

    expect(result).toEqual({ ok: false, error: 'invalid_date' });
  });

  it('February 29th of a leap year is accepted', async () => {
    const world = aBookingWorld({ now: new Date('2027-10-17T15:00:00Z') });

    const result = await world.createBooking.execute(aCreateBookingInput({ preferredDate: '2028-02-29' }));

    expect(result.ok).toBe(true);
  });

  it('a date written in another format is rejected', async () => {
    const result = await aBookingWorld().createBooking.execute(aCreateBookingInput({ preferredDate: '20/11/2026' }));

    expect(result).toEqual({ ok: false, error: 'invalid_date' });
  });

  it('counts today in Buenos Aires time even when it is already tomorrow in UTC', async () => {
    const world = aBookingWorld({ now: new Date('2026-10-18T01:00:00Z') });

    const result = await world.createBooking.execute(aCreateBookingInput({ preferredDate: '2026-10-19' }));

    expect(result.ok).toBe(true);
  });

  it('Mercado Pago down does not leave orphan bookings and reports the failure', async () => {
    const world = aBookingWorld();
    world.gateway.failCheckoutsWith(new Error('mp down'));

    const result = await world.createBooking.execute(aCreateBookingInput());

    expect(result).toEqual({ ok: false, error: 'gateway_unavailable' });
    expect(world.bookings.all()).toEqual([]);
    expect(world.payments.all()).toEqual([]);
    expect(world.reporter.reported.map((error) => error.message)).toEqual(['mp down']);
  });

  it('reports a gateway failure that is not an Error object', async () => {
    const world = aBookingWorld();
    world.gateway.failCheckoutsWith('timeout');

    await world.createBooking.execute(aCreateBookingInput());

    expect(world.reporter.reported.map((error) => error.message)).toEqual(['timeout']);
  });

  it('there is no booking when the default payment provider is not registered', async () => {
    const world = aBookingWorld({ defaultProvider: 'pix' });

    const result = await world.createBooking.execute(aCreateBookingInput());

    expect(result).toEqual({ ok: false, error: 'gateway_unavailable' });
  });

  it('uses the default provider among several registered ones', async () => {
    const pix = new FakePaymentGateway('pix');
    const card = new FakePaymentGateway('card');
    const world = aBookingWorld({ gateways: [card, pix], defaultProvider: 'pix' });

    await world.createBooking.execute(aCreateBookingInput());

    expect(pix.requests).toHaveLength(1);
    expect(card.requests).toHaveLength(0);
    expect(world.payments.all()[0]?.provider).toBe('pix');
  });

  it('a client who pays the whole session is charged the total and keeps the plan', async () => {
    const world = aBookingWorld();

    await world.createBooking.execute(aCreateBookingInput({ paymentPlan: 'full' }));

    expect(world.gateway.requests[0]).toMatchObject({ title: 'Sesión completa — Maternidad', amountCents: 9_500_000 });
    expect(world.gateway.requests[0]).not.toHaveProperty('expiresAt');
    expect(world.bookings.all()[0]).toMatchObject({ paymentPlan: 'full', depositCents: 4_750_000 });
    expect(world.payments.all()[0]).toMatchObject({ kind: 'full', amountCents: 9_500_000 });
  });

  it('a request without a proposed date is rejected and a missing time of day means any time', async () => {
    const world = aBookingWorld();

    const withoutDate = await world.createBooking.execute(aCreateBookingInput({ preferredDate: '' }));
    const { timeSlot: _omitted, ...withoutTimeSlot } = aCreateBookingInput();
    await world.createBooking.execute(withoutTimeSlot);

    expect(withoutDate).toEqual({ ok: false, error: 'invalid_date' });
    expect(world.bookings.all()[0]?.schedule).toEqual({ kind: 'request', preferredDate: '2026-11-20', timeSlot: 'any' });
  });

  it('a request without any proposed date field is rejected', async () => {
    const { preferredDate: _omitted, ...withoutDate } = aCreateBookingInput();

    expect(await aBookingWorld().createBooking.execute(withoutDate)).toEqual({ ok: false, error: 'invalid_date' });
  });

  describe('with a calendar and a session with duration', () => {
    const slotInput = (overrides = {}) =>
      aCreateBookingInput({ preferredDate: '', slotStart: THURSDAY_MORNING_SLOT, ...overrides });

    it('a client picks a turn and gets a checkout that holds it for 30 minutes with instant payment methods only', async () => {
      const world = aSlotWorld();

      const result = await world.createBooking.execute(slotInput({ paymentPlan: 'full' }));

      expect(result).toEqual({ ok: true, value: { bookingId: 'id-1', checkoutUrl: 'https://pay.example/checkout-1' } });
      expect(world.gateway.requests[0]).toMatchObject({
        title: 'Sesión completa — Maternidad',
        amountCents: 9_500_000,
        expiresAt: new Date('2026-10-17T15:30:00Z'),
        instantMethodsOnly: true,
      });
      expect(world.bookings.all()[0]).toMatchObject({
        status: 'awaiting_payment',
        schedule: { kind: 'slot', start: new Date('2026-10-22T13:00:00Z'), end: new Date('2026-10-22T14:30:00Z') },
        expiresAt: new Date('2026-10-17T15:30:00Z'),
      });
      expect(world.lock.runs).toBe(1);
    });

    it('two clients choose the same turn and only the first one reaches the payment', async () => {
      const world = aSlotWorld();

      const first = await world.createBooking.execute(slotInput());
      const second = await world.createBooking.execute(slotInput({ name: 'Julieta Paz', email: 'julieta@example.com' }));

      expect(first.ok).toBe(true);
      expect(second).toEqual({ ok: false, error: 'slot_taken' });
      expect(world.bookings.all()).toHaveLength(1);
      expect(world.gateway.requests).toHaveLength(1);
    });

    it('a neighbouring turn that would break the buffer is also taken', async () => {
      const world = aSlotWorld();
      await world.createBooking.execute(slotInput());

      const next = await world.createBooking.execute(slotInput({ slotStart: '2026-10-22T14:00:00.000Z' }));

      expect(next).toEqual({ ok: false, error: 'slot_taken' });
    });

    it('a held turn becomes free again when the hold expires', async () => {
      const world = aSlotWorld();
      await world.createBooking.execute(slotInput());
      world.clock.advanceHours(1);

      const second = await world.createBooking.execute(slotInput({ email: 'julieta@example.com' }));

      expect(second.ok).toBe(true);
    });

    it('Sarah blocks the afternoon in her calendar and those turns cannot be booked', async () => {
      const world = aSlotWorld();
      world.calendar?.blocks({ start: new Date('2026-10-22T18:00:00Z'), end: new Date('2026-10-22T22:00:00Z') });

      const afternoon = await world.createBooking.execute(slotInput({ slotStart: '2026-10-22T18:00:00.000Z' }));
      const morning = await world.createBooking.execute(slotInput());

      expect(afternoon).toEqual({ ok: false, error: 'slot_taken' });
      expect(morning.ok).toBe(true);
    });

    it('a turn is required', async () => {
      const world = aSlotWorld();
      const { slotStart: _omitted, ...withoutSlot } = slotInput();

      expect(await world.createBooking.execute(withoutSlot)).toEqual({ ok: false, error: 'slot_required' });
      expect(await world.createBooking.execute(slotInput({ slotStart: '' }))).toEqual({ ok: false, error: 'slot_required' });
    });

    it('a turn that is not a date, is off the grid or is outside the windows is taken', async () => {
      const world = aSlotWorld();

      for (const slotStart of ['mañana', '2026-10-22T13:15:00.000Z', '2026-10-21T13:00:00.000Z']) {
        expect(await world.createBooking.execute(slotInput({ slotStart }))).toEqual({ ok: false, error: 'slot_taken' });
      }
    });

    it('Google down while listing turns reports the problem and creates nothing', async () => {
      const world = aSlotWorld();
      world.calendar?.goesDown();

      const result = await world.createBooking.execute(slotInput());

      expect(result).toEqual({ ok: false, error: 'calendar_unavailable' });
      expect(world.reporter.reported).toHaveLength(1);
      expect(world.bookings.all()).toEqual([]);
    });

    it('an unexpected calendar failure is not disguised as unavailable', async () => {
      const world = aSlotWorld();
      world.calendar?.crashes();

      await expect(world.createBooking.execute(slotInput())).rejects.toThrow('boom');
    });

    it('Mercado Pago down does not hold the turn', async () => {
      const world = aSlotWorld();
      world.gateway.failCheckoutsWith(new Error('mp down'));

      const result = await world.createBooking.execute(slotInput());

      expect(result).toEqual({ ok: false, error: 'gateway_unavailable' });
      expect(world.bookings.all()).toEqual([]);
    });

    it('a session without duration uses a proposed date even if there is a calendar', async () => {
      const world = aSlotWorld({ offers: [aBookingOffer({ durationMinutes: null })] });

      const result = await world.createBooking.execute(aCreateBookingInput({ slotStart: THURSDAY_MORNING_SLOT }));

      expect(result.ok).toBe(true);
      expect(world.bookings.all()[0]?.schedule).toEqual({ kind: 'request', preferredDate: '2026-11-20', timeSlot: 'morning' });
      expect(world.gateway.requests[0]).not.toHaveProperty('instantMethodsOnly');
    });

    it('without weekly windows loaded the client proposes a date', async () => {
      const world = aSlotWorld({ scheduling: { windows: [] } });

      await world.createBooking.execute(aCreateBookingInput());

      expect(world.bookings.all()[0]?.schedule.kind).toBe('request');
    });

    it('without a configured calendar the client proposes a date', async () => {
      const world = aSlotWorld({ calendar: null });

      await world.createBooking.execute(aCreateBookingInput());

      expect(world.bookings.all()[0]?.schedule.kind).toBe('request');
    });
  });
});
