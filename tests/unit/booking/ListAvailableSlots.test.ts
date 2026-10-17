import { describe, expect, it } from 'vitest';
import { aBookingOffer } from '../../fixtures/aBookingOffer';
import { aBookingWorld, aSlotWorld } from '../../fixtures/aBookingWorld';

const thursday = { offerSlug: 'maternidad', from: '2026-10-22', to: '2026-10-22' };

describe('ListAvailableSlots', () => {
  it('shows a client the free turns of the day with their local hour', async () => {
    const result = await aSlotWorld().listSlots.execute(thursday);

    expect(result.ok && result.value.mode).toBe('slots');
    const day = result.ok ? result.value.days[0] : undefined;
    expect(day?.date).toBe('2026-10-22');
    expect(day?.slots[0]).toEqual({ start: '2026-10-22T13:00:00.000Z', end: '2026-10-22T14:30:00.000Z', label: '10:00' });
    expect(day?.slots.map((slot) => slot.label)).toEqual(['10:00', '10:30', '11:00', '11:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']);
  });

  it('Lara blocks the afternoon in her Google Calendar and those turns disappear', async () => {
    const world = aSlotWorld();
    world.calendar?.blocks({ start: new Date('2026-10-22T18:00:00Z'), end: new Date('2026-10-22T22:00:00Z') });

    const result = await world.listSlots.execute(thursday);

    expect(result.ok && result.value.days[0]?.slots.map((slot) => slot.label)).toEqual(['10:00', '10:30', '11:00', '11:30']);
  });

  it('a turn held by a client who is paying takes the whole morning away because of the buffer', async () => {
    const world = aSlotWorld();
    await world.createBooking.execute({
      offerSlug: 'maternidad',
      paymentPlan: 'deposit',
      slotStart: '2026-10-22T13:00:00.000Z',
      name: 'Camila Ríos',
      email: 'camila@example.com',
      phone: '1',
      notes: '',
    });

    const result = await world.listSlots.execute(thursday);

    expect(result.ok && result.value.days[0]?.slots.map((slot) => slot.label).slice(0, 2)).toEqual(['15:00', '15:30']);
  });

  it('a session without duration shows no turns and asks for a proposed date', async () => {
    const result = await aSlotWorld({ offers: [aBookingOffer()] }).listSlots.execute(thursday);

    expect(result).toEqual({ ok: true, value: { mode: 'request', days: [] } });
  });

  it('without a calendar there are no turns either', async () => {
    const result = await aBookingWorld().listSlots.execute(thursday);

    expect(result).toEqual({ ok: true, value: { mode: 'request', days: [] } });
  });

  it('an unknown session has no turns', async () => {
    expect(await aSlotWorld().listSlots.execute({ ...thursday, offerSlug: 'bodas' })).toEqual({ ok: false, error: 'offer_not_found' });
  });

  it('rejects ranges that are not real dates, inverted or longer than 31 days', async () => {
    const world = aSlotWorld();

    for (const range of [
      { from: '2026-02-30', to: '2026-03-02' },
      { from: '2026-10-22', to: 'mañana' },
      { from: '2026-10-23', to: '2026-10-22' },
      { from: '2026-10-01', to: '2026-11-01' },
    ]) {
      expect(await world.listSlots.execute({ offerSlug: 'maternidad', ...range })).toEqual({ ok: false, error: 'invalid_range' });
    }
  });

  it('accepts a range of exactly 31 days', async () => {
    const result = await aSlotWorld().listSlots.execute({ offerSlug: 'maternidad', from: '2026-10-01', to: '2026-10-31' });

    expect(result.ok && result.value.days).toHaveLength(31);
  });

  it('Google down reports the problem and tells the client the agenda is unavailable', async () => {
    const world = aSlotWorld();
    world.calendar?.goesDown();

    const result = await world.listSlots.execute(thursday);

    expect(result).toEqual({ ok: false, error: 'calendar_unavailable' });
    expect(world.reporter.reported).toHaveLength(1);
  });

  it('an unexpected failure is not disguised as an unavailable calendar', async () => {
    const world = aSlotWorld();
    world.calendar?.crashes();

    await expect(world.listSlots.execute(thursday)).rejects.toThrow('boom');
  });
});
