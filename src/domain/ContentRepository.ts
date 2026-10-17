import type { BookingOffer } from './booking/BookingOffer';
import type { BrandsContent } from './BrandsContent';
import type { Facet } from './Facet';
import type { HomeContent } from './HomeContent';
import type { ObraContent } from './ObraContent';
import type { Print } from './Print';
import type { Locale } from './Locale';
import type { PrintsContent } from './PrintsContent';
import type { SchedulingSettings } from './scheduling/SchedulingSettings';
import type { Series } from './Series';
import type { SiteSettings } from './SiteSettings';
import type { SiteTexts } from './SiteTexts';

export interface ContentRepository {
  getSettings(locale: Locale): Promise<SiteSettings>;
  getHome(locale: Locale): Promise<HomeContent>;
  getFacets(locale: Locale): Promise<Facet[]>;
  getBrands(locale: Locale): Promise<BrandsContent>;
  getObra(locale: Locale): Promise<ObraContent>;
  getSeries(locale: Locale): Promise<Series[]>;
  getPrints(locale: Locale): Promise<Print[]>;
  getPrintsContent(locale: Locale): Promise<PrintsContent>;
  getBookingOffers(locale: Locale): Promise<BookingOffer[]>;
  getSchedulingSettings(): Promise<SchedulingSettings>;
  getTexts(locale: Locale): Promise<SiteTexts>;
}
