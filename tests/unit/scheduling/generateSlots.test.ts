import { describe, expect, it } from 'vitest';
import type { DaySlots } from '@/application/scheduling/DaySlots';
import { generateSlots } from '@/application/scheduling/generateSlots';
import type { TimeRange } from '@/domain/scheduling/TimeRange';
import { aSchedulingSettings, tuesdayAndThursdayWindows } from '../../fixtures/aSchedulingSettings';

const SATURDAY_AFTERNOON = new Date('2026-10-17T15:00:00Z');
const THURSDAY = '2026-10-22';

const starts = (days: DaySlots[]): string[] => days.flatMap((day) => day.slots.map((slot) => slot.start.toISOString().slice(0, 16).replace('T', ' ')));

const busy = (start: string, end: string): TimeRange => ({ start: new Date(start), end: new Date(end) });

const query = (overrides = {}) => ({
  settings: aSchedulingSettings({ windows: tuesdayAndThursdayWindows() }),
  durationMinutes: 90,
  busy: [],
  now: SATURDAY_AFTERNOON,
  from: THURSDAY,
  to: THURSDAY,
  ...overrides,
});

describe('generateSlots', () => {
  it('offers every half hour inside a split morning and afternoon window, in Buenos Aires time', () => {
    expect(starts(generateSlots(query()))).toEqual([
      '2026-10-22 13:00',
      '2026-10-22 13:30',
      '2026-10-22 14:00',
      '2026-10-22 14:30',
      '2026-10-22 18:00',
      '2026-10-22 18:30',
      '2026-10-22 19:00',
      '2026-10-22 19:30',
      '2026-10-22 20:00',
      '2026-10-22 20:30',
    ]);
  });

  it('every slot lasts the duration of the session and ends before the window closes', () => {
    const [day] = generateSlots(query());

    expect(day?.slots[3]).toEqual({ start: new Date('2026-10-22T14:30:00Z'), end: new Date('2026-10-22T16:00:00Z') });
    expect(day?.slots.at(-1)?.end).toEqual(new Date('2026-10-22T22:00:00Z'));
  });

  it('a day without windows is listed with no slots', () => {
    const days = generateSlots(query({ from: '2026-10-21', to: '2026-10-22' }));

    expect(days.map((day) => [day.date, day.slots.length])).toEqual([
      ['2026-10-21', 0],
      ['2026-10-22', 10],
    ]);
  });

  it('a session longer than the window never fits', () => {
    const settings = aSchedulingSettings({ windows: [{ weekday: 4, from: '10:00', to: '11:00' }] });

    expect(starts(generateSlots(query({ settings })))).toEqual([]);
  });

  it('keeps a buffer on both sides of something already busy', () => {
    const occupied = busy('2026-10-22T18:00:00Z', '2026-10-22T19:00:00Z');

    expect(starts(generateSlots(query({ busy: [occupied] }))).slice(4)).toEqual(['2026-10-22 19:30', '2026-10-22 20:00', '2026-10-22 20:30']);
    expect(starts(generateSlots(query({ busy: [occupied] }))).slice(0, 4)).toHaveLength(4);
  });

  it('without buffer only the slots that really overlap disappear', () => {
    const settings = aSchedulingSettings({ windows: tuesdayAndThursdayWindows(), bufferMinutes: 0 });
    const occupied = busy('2026-10-22T18:00:00Z', '2026-10-22T19:00:00Z');

    expect(starts(generateSlots(query({ settings, busy: [occupied] }))).slice(4)).toEqual([
      '2026-10-22 19:00',
      '2026-10-22 19:30',
      '2026-10-22 20:00',
      '2026-10-22 20:30',
    ]);
  });

  it('a busy range that only covers part of a slot still takes it away', () => {
    const settings = aSchedulingSettings({ windows: tuesdayAndThursdayWindows(), bufferMinutes: 0 });
    const occupied = busy('2026-10-22T15:45:00Z', '2026-10-22T16:15:00Z');

    expect(starts(generateSlots(query({ settings, busy: [occupied] }))).slice(0, 3)).toEqual(['2026-10-22 13:00', '2026-10-22 13:30', '2026-10-22 14:00']);
  });

  it('does not offer slots that start before the minimum notice and offers the first one at the limit', () => {
    const now = new Date('2026-10-20T14:00:00Z');

    expect(starts(generateSlots(query({ now }))).slice(0, 2)).toEqual(['2026-10-22 14:00', '2026-10-22 14:30']);
  });

  it('does not offer slots beyond the booking horizon', () => {
    const settings = aSchedulingSettings({ windows: tuesdayAndThursdayWindows(), minNoticeHours: 0, horizonDays: 5 });

    expect(starts(generateSlots(query({ settings })))).toEqual(['2026-10-22 13:00', '2026-10-22 13:30', '2026-10-22 14:00', '2026-10-22 14:30']);
  });

  it('merges overlapping windows without repeating or misordering slots', () => {
    const settings = aSchedulingSettings({
      windows: [
        { weekday: 4, from: '11:00', to: '14:00' },
        { weekday: 4, from: '10:00', to: '13:00' },
      ],
      slotStepMinutes: 60,
    });

    expect(starts(generateSlots(query({ settings, durationMinutes: 60 })))).toEqual([
      '2026-10-22 13:00',
      '2026-10-22 14:00',
      '2026-10-22 15:00',
      '2026-10-22 16:00',
    ]);
  });

  it('a step of zero minutes does not hang the server', () => {
    const settings = aSchedulingSettings({ windows: [{ weekday: 4, from: '10:00', to: '11:00' }], slotStepMinutes: 0 });

    expect(starts(generateSlots(query({ settings, durationMinutes: 60 })))).toEqual(['2026-10-22 13:00']);
  });

  it('an inverted range has no days', () => {
    expect(generateSlots(query({ from: '2026-10-23', to: '2026-10-22' }))).toEqual([]);
  });

  it('keeps wall clock hours across the Madrid daylight saving change', () => {
    const settings = aSchedulingSettings({
      timeZone: 'Europe/Madrid',
      windows: [
        { weekday: 6, from: '10:00', to: '12:00' },
        { weekday: 7, from: '10:00', to: '12:00' },
      ],
      minNoticeHours: 0,
      horizonDays: 365,
      bufferMinutes: 0,
      slotStepMinutes: 60,
    });

    const days = generateSlots(query({ settings, durationMinutes: 60, now: new Date('2026-01-01T00:00:00Z'), from: '2026-03-28', to: '2026-03-29' }));

    expect(starts(days)).toEqual(['2026-03-28 09:00', '2026-03-28 10:00', '2026-03-29 08:00', '2026-03-29 09:00']);
  });
});
