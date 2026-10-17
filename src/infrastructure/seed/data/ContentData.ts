import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { ContentBookingOffer } from './ContentBookingOffer';
import type { ContentBrands } from './ContentBrands';
import type { ContentFacet } from './ContentFacet';
import type { ContentHome } from './ContentHome';
import type { ContentObra } from './ContentObra';
import type { ContentPrints } from './ContentPrints';
import type { ContentSettings } from './ContentSettings';

export interface ContentData {
  home: ContentHome;
  facets: ContentFacet[];
  brands: ContentBrands;
  obra: ContentObra;
  prints: ContentPrints;
  settings: ContentSettings;
  bookingOffers: ContentBookingOffer[];
  scheduling: SchedulingSettings;
}
