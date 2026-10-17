import type { Clock } from '@/domain/Clock';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { ErrorReporter } from '@/domain/ErrorReporter';
import { defaultLocale } from '@/domain/Locale';
import { CalendarUnavailableError } from '@/domain/scheduling/CalendarUnavailableError';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { ListAvailableSlotsInput } from '../inputs/ListAvailableSlotsInput';
import type { AvailableSlots } from '../results/AvailableSlots';
import { fail } from '../results/fail';
import type { ListSlotsError } from '../results/ListSlotsError';
import { ok } from '../results/ok';
import type { Result } from '../results/Result';
import type { DaySlots } from '../scheduling/DaySlots';
import { slotDurationFor } from '../scheduling/slotDurationFor';
import type { SlotAvailability } from '../scheduling/SlotAvailability';
import { addDays, localTimeLabel } from '../scheduling/zonedTime';
import { isRealDate } from './isRealDate';

const MAX_RANGE_DAYS = 31;

export class ListAvailableSlots {
  constructor(
    private readonly content: ContentRepository,
    private readonly availability: SlotAvailability,
    private readonly calendar: CalendarProvider | null,
    private readonly clock: Clock,
    private readonly reporter: ErrorReporter,
  ) {}

  async execute({ offerSlug, from, to }: ListAvailableSlotsInput): Promise<Result<AvailableSlots, ListSlotsError>> {
    if (!isRealDate(from) || !isRealDate(to) || from > to || to > addDays(from, MAX_RANGE_DAYS - 1)) {
      return fail('invalid_range');
    }
    const offers = await this.content.getBookingOffers(defaultLocale);
    const offer = offers.find((candidate) => candidate.slug === offerSlug);
    if (!offer) {
      return fail('offer_not_found');
    }
    const settings = await this.content.getSchedulingSettings();
    const durationMinutes = slotDurationFor(offer, settings, this.calendar);
    if (durationMinutes === null) {
      return ok({ mode: 'request', days: [] });
    }
    let free: DaySlots[];
    try {
      free = await this.availability.freeSlots({ settings, durationMinutes, from, to, now: this.clock.now() });
    } catch (error) {
      if (!(error instanceof CalendarUnavailableError)) {
        throw error;
      }
      this.reporter.report(error);
      return fail('calendar_unavailable');
    }
    return ok({
      mode: 'slots',
      days: free.map((day) => ({
        date: day.date,
        slots: day.slots.map((slot) => ({
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          label: localTimeLabel(slot.start, settings.timeZone),
        })),
      })),
    });
  }
}
