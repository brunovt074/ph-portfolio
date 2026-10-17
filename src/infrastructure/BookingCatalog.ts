import type { ListBookingOffers } from '@/application/booking/ListBookingOffers';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';

export interface BookingCatalog {
  content: ContentRepository;
  calendar: CalendarProvider | null;
  listBookingOffers: ListBookingOffers;
  demoPricing: boolean;
  timeZone: string;
}
