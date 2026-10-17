import { TZDate } from '@date-fns/tz';
import { format } from 'date-fns';
import type { TimeRange } from '@/domain/scheduling/TimeRange';

const DAY_IN_MILLISECONDS = 86_400_000;

export const addDays = (isoDay: string, days: number): string =>
  new Date(Date.parse(`${isoDay}T00:00:00Z`) + days * DAY_IN_MILLISECONDS).toISOString().slice(0, 10);

export const instantAt = (isoDay: string, minutesIntoDay: number, timeZone: string): Date => {
  const [year, month, day] = isoDay.split('-').map(Number) as [number, number, number];
  const instant = new TZDate(year, month - 1, day, Math.floor(minutesIntoDay / 60), minutesIntoDay % 60, 0, 0, timeZone);
  return new Date(instant.getTime());
};

export const localDateOf = (instant: Date, timeZone: string): string => format(new TZDate(instant.getTime(), timeZone), 'yyyy-MM-dd');

export const localTimeLabel = (instant: Date, timeZone: string): string => format(new TZDate(instant.getTime(), timeZone), 'HH:mm');

export const daysRange = (from: string, to: string, timeZone: string): TimeRange => ({
  start: instantAt(from, 0, timeZone),
  end: instantAt(addDays(to, 1), 0, timeZone),
});
