import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { TimeRange } from '@/domain/scheduling/TimeRange';
import type { DaySlots } from './DaySlots';
import type { FreeSlotsQuery } from './FreeSlotsQuery';
import { generateSlots } from './generateSlots';
import { overlapsWithBuffer } from './overlapsWithBuffer';
import type { SlotFreeQuery } from './SlotFreeQuery';
import { daysRange } from './zonedTime';

const MINUTE_IN_MILLISECONDS = 60_000;

const widen = (range: TimeRange, minutes: number): TimeRange => ({
  start: new Date(range.start.getTime() - minutes * MINUTE_IN_MILLISECONDS),
  end: new Date(range.end.getTime() + minutes * MINUTE_IN_MILLISECONDS),
});

export class SlotAvailability {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly calendar: CalendarProvider | null,
  ) {}

  async freeSlots({ settings, durationMinutes, from, to, now }: FreeSlotsQuery): Promise<DaySlots[]> {
    const range = widen(daysRange(from, to, settings.timeZone), settings.bufferMinutes);
    const busy = await this.busyIn(range, now, null);
    return generateSlots({ settings, durationMinutes, busy, now, from, to });
  }

  async isFree({ settings, range, now, excludeBookingId }: SlotFreeQuery): Promise<boolean> {
    const busy = await this.busyIn(widen(range, settings.bufferMinutes), now, excludeBookingId);
    return !busy.some((occupied) => overlapsWithBuffer(range, occupied, settings.bufferMinutes));
  }

  private async busyIn(range: TimeRange, now: Date, excludeBookingId: string | null): Promise<TimeRange[]> {
    const external = this.calendar ? await this.calendar.busy(range) : [];
    const held = await this.bookings.findBlocking(range, now);
    const own = held.flatMap((booking) => (booking.id !== excludeBookingId && booking.schedule.kind === 'slot' ? [booking.schedule] : []));
    return [...external, ...own];
  }
}
