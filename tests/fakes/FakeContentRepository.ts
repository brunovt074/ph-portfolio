import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { BrandsContent } from '@/domain/BrandsContent';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { Facet } from '@/domain/Facet';
import type { HomeContent } from '@/domain/HomeContent';
import type { ObraContent } from '@/domain/ObraContent';
import type { Locale } from '@/domain/Locale';
import type { Print } from '@/domain/Print';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { Series } from '@/domain/Series';
import type { SiteSettings } from '@/domain/SiteSettings';
import { aBookingOffer } from '../fixtures/aBookingOffer';
import type { SiteTexts } from '@/domain/SiteTexts';
import { defaultSiteTexts } from '@/infrastructure/texts/defaults/defaultSiteTexts';
import { aBrands } from '../fixtures/aBrands';
import { allFacets } from '../fixtures/aFacet';
import { aHome } from '../fixtures/aHome';
import { anObra } from '../fixtures/anObra';
import { aPrintsContent } from '../fixtures/aPrintsContent';
import { allSeries } from '../fixtures/aSeries';
import { aSchedulingSettings } from '../fixtures/aSchedulingSettings';
import { aSettings } from '../fixtures/aSettings';

export interface FakeContentData {
  settings: SiteSettings;
  home: HomeContent;
  facets: Facet[];
  brands: BrandsContent;
  obra: ObraContent;
  series: Series[];
  prints: Print[];
  printsContent: PrintsContent;
  bookingOffers: BookingOffer[];
  scheduling: SchedulingSettings;
  texts?: SiteTexts;
}

export class FakeContentRepository implements ContentRepository {
  private readonly data: FakeContentData;

  constructor(overrides: Partial<FakeContentData> = {}) {
    this.data = {
      settings: aSettings(),
      home: aHome(),
      facets: allFacets(),
      brands: aBrands(),
      obra: anObra(),
      series: allSeries(),
      prints: [],
      printsContent: aPrintsContent(),
      bookingOffers: [aBookingOffer()],
      scheduling: aSchedulingSettings(),
      ...overrides,
    };
  }

  async getSettings(_locale: Locale): Promise<SiteSettings> {
    return this.data.settings;
  }

  async getHome(_locale: Locale): Promise<HomeContent> {
    return this.data.home;
  }

  async getFacets(_locale: Locale): Promise<Facet[]> {
    return this.data.facets;
  }

  async getBrands(_locale: Locale): Promise<BrandsContent> {
    return this.data.brands;
  }

  async getObra(_locale: Locale): Promise<ObraContent> {
    return this.data.obra;
  }

  async getSeries(_locale: Locale): Promise<Series[]> {
    return this.data.series;
  }

  async getPrints(_locale: Locale): Promise<Print[]> {
    return this.data.prints;
  }

  async getPrintsContent(_locale: Locale): Promise<PrintsContent> {
    return this.data.printsContent;
  }

  async getBookingOffers(_locale: Locale): Promise<BookingOffer[]> {
    return this.data.bookingOffers;
  }

  async getSchedulingSettings(): Promise<SchedulingSettings> {
    return this.data.scheduling;
  }

  async getTexts(locale: Locale): Promise<SiteTexts> {
    return this.data.texts ?? defaultSiteTexts[locale];
  }
}
