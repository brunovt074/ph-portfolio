import type { SiteSettings } from '@/domain/SiteSettings';
import type { LocatedFacet } from './LocatedFacet';

export interface FacetPageData extends LocatedFacet {
  settings: SiteSettings;
}
