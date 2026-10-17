import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';

export const slotDurationFor = (offer: BookingOffer, settings: SchedulingSettings, calendar: CalendarProvider | null): number | null =>
  calendar !== null && settings.windows.length > 0 ? offer.durationMinutes : null;
