import { describe, expect, it } from 'vitest';
import { SimulatedCalendarProvider } from '@/infrastructure/scheduling/simulated/SimulatedCalendarProvider';

const event = (start: string, end: string) => ({ bookingId: 'booking-1', start: new Date(start), end: new Date(end), title: 'Reserva', description: '' });
const day = { start: new Date('2026-10-22T03:00:00Z'), end: new Date('2026-10-23T03:00:00Z') };

describe('SimulatedCalendarProvider', () => {
  it('counts the events it creates as busy time', async () => {
    const calendar = new SimulatedCalendarProvider();

    const id = await calendar.createEvent(event('2026-10-22T13:00:00Z', '2026-10-22T14:30:00Z'));

    expect(id).toBe('simevent_1');
    expect(await calendar.busy(day)).toEqual([{ start: new Date('2026-10-22T13:00:00Z'), end: new Date('2026-10-22T14:30:00Z') }]);
  });

  it('ignores events outside the asked range', async () => {
    const calendar = new SimulatedCalendarProvider();
    await calendar.createEvent(event('2026-10-25T13:00:00Z', '2026-10-25T14:30:00Z'));

    expect(await calendar.busy(day)).toEqual([]);
  });

  it('frees the time when the event is deleted', async () => {
    const calendar = new SimulatedCalendarProvider();
    const id = await calendar.createEvent(event('2026-10-22T13:00:00Z', '2026-10-22T14:30:00Z'));

    await calendar.deleteEvent(id);

    expect(await calendar.busy(day)).toEqual([]);
  });

  it('identifies itself as simulado', () => {
    expect(new SimulatedCalendarProvider().provider).toBe('simulado');
  });
});
