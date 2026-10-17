import type { ContentRepository } from '@/domain/ContentRepository';
import type { BookingOfferView } from '../results/BookingOfferView';
import { calculateDeposit } from './calculateDeposit';

export class ListBookingOffers {
  constructor(private readonly content: ContentRepository) {}

  async execute(): Promise<BookingOfferView[]> {
    const offers = await this.content.getBookingOffers();
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
        bookable,
      };
    });
  }
}
