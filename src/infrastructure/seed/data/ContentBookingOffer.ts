import type { FacetSlug } from '@/domain/FacetSlug';

export interface ContentBookingOffer {
  slug: string;
  title: string;
  description: string;
  facet: FacetSlug;
  price: number | null;
  duration: number | null;
  depositPercent: number;
  order: number;
}
