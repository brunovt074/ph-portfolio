import type { Weekday } from '@/domain/scheduling/Weekday';
import type { TimeRange } from '@/domain/scheduling/TimeRange';
import type { DaySlots } from './DaySlots';
import { overlapsWithBuffer } from './overlapsWithBuffer';
import type { SlotQuery } from './SlotQuery';
import { addDays, instantAt } from './zonedTime';

const MINUTE_IN_MILLISECONDS = 60_000;
const HOUR_IN_MILLISECONDS = 3_600_000;
const DAY_IN_MILLISECONDS = 86_400_000;

const minutesOf = (clock: string): number => {
  const [hours, minutes] = clock.split(':').map(Number) as [number, number];
  return hours * 60 + minutes;
};

const isoWeekdayOf = (isoDay: string): Weekday => {
  const day = new Date(`${isoDay}T00:00:00Z`).getUTCDay();
  return (day === 0 ? 7 : day) as Weekday;
};

export const generateSlots = ({ settings, durationMinutes, busy, now, from, to }: SlotQuery): DaySlots[] => {
  const earliest = now.getTime() + settings.minNoticeHours * HOUR_IN_MILLISECONDS;
  const latest = now.getTime() + settings.horizonDays * DAY_IN_MILLISECONDS;
  const duration = durationMinutes * MINUTE_IN_MILLISECONDS;
  const days: DaySlots[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) {
    const slots = new Map<number, TimeRange>();
    settings.windows
      .filter((window) => window.weekday === isoWeekdayOf(date))
      .forEach((window) => {
        const windowEnd = instantAt(date, minutesOf(window.to), settings.timeZone).getTime();
        for (let minute = minutesOf(window.from); ; minute += Math.max(1, settings.slotStepMinutes)) {
          const start = instantAt(date, minute, settings.timeZone);
          const end = new Date(start.getTime() + duration);
          if (end.getTime() > windowEnd) {
            break;
          }
          const candidate = { start, end };
          const allowed = start.getTime() >= earliest && start.getTime() <= latest;
          if (allowed && !busy.some((range) => overlapsWithBuffer(candidate, range, settings.bufferMinutes))) {
            slots.set(start.getTime(), candidate);
          }
        }
      });
    days.push({ date, slots: [...slots.values()].sort((first, second) => first.start.getTime() - second.start.getTime()) });
  }
  return days;
};
