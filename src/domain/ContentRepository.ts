import type { BrandsContent } from './BrandsContent';
import type { Facet } from './Facet';
import type { HomeContent } from './HomeContent';
import type { ObraContent } from './ObraContent';
import type { Print } from './Print';
import type { PrintsContent } from './PrintsContent';
import type { Series } from './Series';
import type { SiteSettings } from './SiteSettings';

export interface ContentRepository {
  getSettings(): Promise<SiteSettings>;
  getHome(): Promise<HomeContent>;
  getFacets(): Promise<Facet[]>;
  getBrands(): Promise<BrandsContent>;
  getObra(): Promise<ObraContent>;
  getSeries(): Promise<Series[]>;
  getPrints(): Promise<Print[]>;
  getPrintsContent(): Promise<PrintsContent>;
}
