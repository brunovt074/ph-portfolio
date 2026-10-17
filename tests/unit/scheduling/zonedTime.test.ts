import { describe, expect, it } from 'vitest';
import { daysRange, localDateOf, localTimeLabel } from '@/application/scheduling/zonedTime';

describe('zonedTime', () => {
  it('reads the local day and hour of an instant in Buenos Aires even when it is already tomorrow in UTC', () => {
    const instant = new Date('2026-10-23T01:30:00Z');

    expect(localDateOf(instant, 'America/Argentina/Buenos_Aires')).toBe('2026-10-22');
    expect(localTimeLabel(instant, 'America/Argentina/Buenos_Aires')).toBe('22:30');
  });

  it('covers whole local days from midnight to midnight', () => {
    expect(daysRange('2026-10-22', '2026-10-23', 'America/Argentina/Buenos_Aires')).toEqual({
      start: new Date('2026-10-22T03:00:00Z'),
      end: new Date('2026-10-24T03:00:00Z'),
    });
  });
});
