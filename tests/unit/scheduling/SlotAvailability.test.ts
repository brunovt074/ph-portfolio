import { describe, expect, it } from 'vitest';
import { SlotAvailability } from '@/application/scheduling/SlotAvailability';
import type { BookingRepository } from '@/domain/booking/BookingRepository';
import { FakeCalendarProvider } from '../../fakes/FakeCalendarProvider';
import { InMemoryBookingRepository } from '../../fakes/InMemoryBookingRepository';
import { aBooking, aSlotBooking } from '../../fixtures/aBooking';
import { aSchedulingSettings, tuesdayAndThursdayWindows } from '../../fixtures/aSchedulingSettings';

const now = new Date('2026-10-17T15:00:00Z');
const settings = aSchedulingSettings({ windows: tuesdayAndThursdayWindows() });
const morning = { start: new Date('2026-10-22T13:00:00Z'), end: new Date('2026-10-22T14:30:00Z') };

describe('SlotAvailability', () => {
  it('lists the free turns of a day taking confirmed bookings and Google busy ranges into account', async () => {
    const bookings = new InMemoryBookingRepository();
    await bookings.create(aSlotBooking({ id: 'a', status: 'confirmed', schedule: { kind: 'slot', ...morning } }));
    const calendar = new FakeCalendarProvider();
    calendar.blocks({ start: new Date('2026-10-22T18:00:00Z'), end: new Date('2026-10-22T22:00:00Z') });

    const [day] = await new SlotAvailability(bookings, calendar).freeSlots({ settings, durationMinutes: 90, from: '2026-10-22', to: '2026-10-22', now });

    expect(day?.slots).toEqual([]);
  });

  it('works without a calendar using only the bookings', async () => {
    const [day] = await new SlotAvailability(new InMemoryBookingRepository(), null).freeSlots({
      settings,
      durationMinutes: 90,
      from: '2026-10-22',
      to: '2026-10-22',
      now,
    });

    expect(day?.slots).toHaveLength(10);
  });

  it('a turn is free for the booking that holds it', async () => {
    const bookings = new InMemoryBookingRepository();
    await bookings.create(aSlotBooking({ schedule: { kind: 'slot', ...morning } }));

    const free = await new SlotAvailability(bookings, null).isFree({ settings, range: morning, now, excludeBookingId: 'booking-1' });

    expect(free).toBe(true);
  });

  it('a turn is not free when another booking holds it', async () => {
    const bookings = new InMemoryBookingRepository();
    await bookings.create(aSlotBooking({ id: 'other', status: 'confirmed', schedule: { kind: 'slot', ...morning } }));

    const free = await new SlotAvailability(bookings, null).isFree({ settings, range: morning, now, excludeBookingId: 'booking-1' });

    expect(free).toBe(false);
  });

  it('a turn is not free when it touches a busy range within the buffer', async () => {
    const calendar = new FakeCalendarProvider();
    calendar.blocks({ start: new Date('2026-10-22T14:40:00Z'), end: new Date('2026-10-22T15:30:00Z') });

    const free = await new SlotAvailability(new InMemoryBookingRepository(), calendar).isFree({ settings, range: morning, now, excludeBookingId: 'x' });

    expect(free).toBe(false);
  });

  it('ignores bookings that are not turns even if a repository returned them', async () => {
    const repository: BookingRepository = {
      create: async () => {},
      findById: async () => null,
      update: async () => {},
      findBlocking: async () => [aBooking({ id: 'proposed' })],
    };

    const free = await new SlotAvailability(repository, null).isFree({ settings, range: morning, now, excludeBookingId: 'x' });

    expect(free).toBe(true);
  });
});
