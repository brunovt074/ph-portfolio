import type { BrandsContent } from '@/domain/BrandsContent';
import type { SiteSettings } from '@/domain/SiteSettings';
import type { LocatedFacet } from './LocatedFacet';

export interface BrandsPageData extends LocatedFacet {
  brands: BrandsContent;
  settings: SiteSettings;
}
