import type { ContentRepository } from '@/domain/ContentRepository';
import { locales, type Locale } from '@/domain/Locale';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { Translations } from '@/domain/Translations';
import type { BookingOffersPage } from '../results/BookingOffersPage';
import { schedulingModeFor } from '../scheduling/schedulingModeFor';
import { calculateDeposit } from './calculateDeposit';

export class ListBookingOffers {
  constructor(
    private readonly content: ContentRepository,
    private readonly calendar: CalendarProvider | null,
  ) {}

  async execute(locale: Locale): Promise<BookingOffersPage> {
    const offers = await this.content.getBookingOffers(locale);
    const settings = await this.content.getSchedulingSettings();
    const views = offers.map((offer) => {
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
    const translations = Object.fromEntries(
      locales.map((language) => [language, offers.every((offer) => offer.translations[language])]),
    ) as Translations;
    return { offers: views, translations };
  }
}
