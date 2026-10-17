import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DrizzleBookingRepository } from '@/infrastructure/db/DrizzleBookingRepository';
import { aBooking, aSlotBooking } from '../../fixtures/aBooking';
import { createTestDatabase } from '../../support/createTestDatabase';

const BOOKING_ID = '11111111-1111-4111-8111-111111111111';

describe('DrizzleBookingRepository', () => {
  let repository: DrizzleBookingRepository;
  let close: () => Promise<void>;

  beforeEach(async () => {
    const database = await createTestDatabase();
    repository = new DrizzleBookingRepository(database.db);
    close = database.close;
  });

  afterEach(async () => {
    await close();
  });

  it('stores a booking and gives back every field including the client data', async () => {
    const booking = aBooking({ id: BOOKING_ID, notes: 'Prefiero luz natural' });

    await repository.create(booking);

    expect(await repository.findById(BOOKING_ID)).toEqual(booking);
  });

  it('keeps an empty note as an empty string, not as null', async () => {
    await repository.create(aBooking({ id: BOOKING_ID, notes: '' }));

    expect((await repository.findById(BOOKING_ID))?.notes).toBe('');
  });

  it('confirms a booking after the deposit arrives', async () => {
    const booking = aBooking({ id: BOOKING_ID, updatedAt: new Date('2020-01-01T00:00:00Z') });
    await repository.create(booking);

    await repository.update({ ...booking, status: 'confirmed' });

    const stored = await repository.findById(BOOKING_ID);
    expect(stored?.status).toBe('confirmed');
    expect(stored?.updatedAt.getTime()).toBeGreaterThan(booking.updatedAt.getTime());
  });

  it('does not find a booking that does not exist', async () => {
    expect(await repository.findById('22222222-2222-4222-8222-222222222222')).toBeNull();
  });

  it('does not find a booking when the id from the url is not a uuid', async () => {
    expect(await repository.findById('no-es-un-uuid')).toBeNull();
  });

  it('stores a turn with its start, end and full payment plan', async () => {
    const booking = aSlotBooking({ id: BOOKING_ID, paymentPlan: 'full' });

    await repository.create(booking);

    expect(await repository.findById(BOOKING_ID)).toEqual(booking);
  });

  it('records the calendar event and the rescheduling state of a paid turn', async () => {
    const booking = aSlotBooking({ id: BOOKING_ID });
    await repository.create(booking);

    await repository.update({ ...booking, status: 'needs_rescheduling', calendarEventId: 'event-1' });

    expect(await repository.findById(BOOKING_ID)).toMatchObject({ status: 'needs_rescheduling', calendarEventId: 'event-1' });
  });

  describe('turns that block the agenda', () => {
    const day = { start: new Date('2026-10-22T03:00:00Z'), end: new Date('2026-10-23T03:00:00Z') };
    const now = new Date('2026-10-17T15:00:00Z');
    const idOf = (n: number) => `55555555-5555-4555-8555-55555555555${n}`;

    const store = async (n: number, overrides = {}) => repository.create(aSlotBooking({ id: idOf(n), ...overrides }));

    it('counts confirmed bookings, bookings to reschedule and holds that have not expired', async () => {
      await store(1, { status: 'confirmed' });
      await store(2, { status: 'needs_rescheduling' });
      await store(3);

      const blocking = await repository.findBlocking(day, now);

      expect(blocking.map((booking) => booking.id).sort()).toEqual([idOf(1), idOf(2), idOf(3)]);
    });

    it('does not count an expired hold, a cancelled booking or a booking proposed by date', async () => {
      await store(1, { expiresAt: new Date('2026-10-17T14:00:00Z') });
      await store(2, { status: 'cancelled' });
      await repository.create(aBooking({ id: idOf(3), status: 'confirmed' }));

      expect(await repository.findBlocking(day, now)).toEqual([]);
    });

    it('does not count turns of another day but counts one that only partly overlaps the range', async () => {
      await store(1, { status: 'confirmed', schedule: { kind: 'slot', start: new Date('2026-10-23T13:00:00Z'), end: new Date('2026-10-23T14:30:00Z') } });
      await store(2, { status: 'confirmed', schedule: { kind: 'slot', start: new Date('2026-10-23T02:00:00Z'), end: new Date('2026-10-23T04:00:00Z') } });
      await store(3, { status: 'confirmed', schedule: { kind: 'slot', start: new Date('2026-10-23T03:00:00Z'), end: new Date('2026-10-23T04:00:00Z') } });

      const blocking = await repository.findBlocking(day, now);

      expect(blocking.map((booking) => booking.id)).toEqual([idOf(2)]);
    });
  });
});
