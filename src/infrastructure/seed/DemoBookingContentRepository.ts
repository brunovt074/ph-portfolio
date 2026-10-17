import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { BrandsContent } from '@/domain/BrandsContent';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { Facet } from '@/domain/Facet';
import type { HomeContent } from '@/domain/HomeContent';
import type { Locale } from '@/domain/Locale';
import type { ObraContent } from '@/domain/ObraContent';
import type { Print } from '@/domain/Print';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { WeeklyWindow } from '@/domain/scheduling/WeeklyWindow';
import type { Series } from '@/domain/Series';
import type { SiteSettings } from '@/domain/SiteSettings';
import type { SiteTexts } from '@/domain/SiteTexts';
import type { BookingDemoData } from './BookingDemoData';

export class DemoBookingContentRepository implements ContentRepository {
  constructor(
    private readonly inner: ContentRepository,
    private readonly demo: BookingDemoData,
  ) {}

  getSettings(): Promise<SiteSettings> {
    return this.inner.getSettings();
  }

  getHome(): Promise<HomeContent> {
    return this.inner.getHome();
  }

  getFacets(): Promise<Facet[]> {
    return this.inner.getFacets();
  }

  getBrands(): Promise<BrandsContent> {
    return this.inner.getBrands();
  }

  getTexts(locale: Locale): Promise<SiteTexts> {
    return this.inner.getTexts(locale);
  }

  getObra(): Promise<ObraContent> {
    return this.inner.getObra();
  }

  getSeries(): Promise<Series[]> {
    return this.inner.getSeries();
  }

  getPrints(): Promise<Print[]> {
    return this.inner.getPrints();
  }

  getPrintsContent(): Promise<PrintsContent> {
    return this.inner.getPrintsContent();
  }

  async getBookingOffers(): Promise<BookingOffer[]> {
    const offers = await this.inner.getBookingOffers();
    return offers.map((offer) => {
      const demoPrice = this.demo.prices[offer.slug];
      const demoDuration = this.demo.durations[offer.slug];
      return {
        ...offer,
        priceCents: offer.priceCents === null && demoPrice !== undefined ? demoPrice * 100 : offer.priceCents,
        durationMinutes: offer.durationMinutes === null && demoDuration !== undefined ? demoDuration : offer.durationMinutes,
      };
    });
  }

  async getSchedulingSettings(): Promise<SchedulingSettings> {
    const settings = await this.inner.getSchedulingSettings();
    return settings.windows.length === 0 ? { ...settings, windows: this.demo.windows as WeeklyWindow[] } : settings;
  }
}
