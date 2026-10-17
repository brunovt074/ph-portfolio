import type { ContentRepository } from '@/domain/ContentRepository';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { BookingOfferView } from '../results/BookingOfferView';
import { schedulingModeFor } from '../scheduling/schedulingModeFor';
import { calculateDeposit } from './calculateDeposit';

export class ListBookingOffers {
  constructor(
    private readonly content: ContentRepository,
    private readonly calendar: CalendarProvider | null,
  ) {}

  async execute(): Promise<BookingOfferView[]> {
    const offers = await this.content.getBookingOffers();
    const settings = await this.content.getSchedulingSettings();
    return offers.map((offer) => {
      const priceCents = offer.priceCents ?? 0;
      const bookable = priceCents > 0;
      return {
        slug: offer.slug,
        title: offer.title,
        description: offer.description,
        totalCents: offer.priceCents,
        depositCents: bookable ? calculateDeposit(priceCents, offer.depositPercent) : null,
        depositPercent: offer.depositPercent,
        durationMinutes: offer.durationMinutes,
        fullPaymentAvailable: true,
        scheduling: schedulingModeFor(offer, settings, this.calendar),
        bookable,
      };
    });
  }
}
