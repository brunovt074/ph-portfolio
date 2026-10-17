import type { BookingConfig } from './BookingConfig';
import { isRealDate, toIsoDay } from './isRealDate';

const DAY_IN_MILLISECONDS = 86_400_000;

export const isBookableDate = (value: string, now: Date, config: BookingConfig): boolean => {
  if (!isRealDate(value)) {
    return false;
  }
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const todayMilliseconds = Date.parse(`${today}T00:00:00Z`);
  const earliest = toIsoDay(todayMilliseconds + config.minLeadDays * DAY_IN_MILLISECONDS);
  const latest = toIsoDay(todayMilliseconds + config.maxLeadDays * DAY_IN_MILLISECONDS);
  return value >= earliest && value <= latest;
};
