import type { Translations } from '@/domain/Translations';
import type { BookingOfferView } from './BookingOfferView';

export interface BookingOffersPage {
  offers: BookingOfferView[];
  translations: Translations;
}
