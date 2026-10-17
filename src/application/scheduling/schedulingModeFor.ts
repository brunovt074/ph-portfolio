import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { SchedulingMode } from '../results/SchedulingMode';
import { slotDurationFor } from './slotDurationFor';

export const schedulingModeFor = (offer: BookingOffer, settings: SchedulingSettings, calendar: CalendarProvider | null): SchedulingMode =>
  slotDurationFor(offer, settings, calendar) === null ? 'request' : 'slots';
