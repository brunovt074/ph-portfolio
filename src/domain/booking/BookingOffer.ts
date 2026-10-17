import type { FacetSlug } from '../FacetSlug';

export interface BookingOffer {
  slug: string;
  title: string;
  description: string;
  facet: FacetSlug;
  priceCents: number | null;
  depositPercent: number;
  durationMinutes: number | null;
  order: number;
}
