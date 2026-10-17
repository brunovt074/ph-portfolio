import type { FacetSlug } from '../FacetSlug';
import type { Translations } from '../Translations';

export interface BookingOffer {
  slug: string;
  title: string;
  description: string;
  facet: FacetSlug;
  priceCents: number | null;
  depositPercent: number;
  durationMinutes: number | null;
  order: number;
  translations: Translations;
}
