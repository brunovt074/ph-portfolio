import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { BrandsContent } from '@/domain/BrandsContent';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { Facet } from '@/domain/Facet';
import type { HomeContent } from '@/domain/HomeContent';
import type { ObraContent } from '@/domain/ObraContent';
import type { Print } from '@/domain/Print';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { Series } from '@/domain/Series';
import type { SiteSettings } from '@/domain/SiteSettings';
import type { SanityBeforeAfterDocument } from './documents/SanityBeforeAfterDocument';
import type { SanityBookingOfferDocument } from './documents/SanityBookingOfferDocument';
import type { SanityBrandPackageDocument } from './documents/SanityBrandPackageDocument';
import type { SanityBrandsDocument } from './documents/SanityBrandsDocument';
import type { SanityFacetDocument } from './documents/SanityFacetDocument';
import type { SanityHomeDocument } from './documents/SanityHomeDocument';
import type { SanityObraDocument } from './documents/SanityObraDocument';
import type { SanityPrintDocument } from './documents/SanityPrintDocument';
import type { SanityPrintsPageDocument } from './documents/SanityPrintsPageDocument';
import type { SanitySchedulingDocument } from './documents/SanitySchedulingDocument';
import type { SanitySeriesDocument } from './documents/SanitySeriesDocument';
import type { SanitySettingsDocument } from './documents/SanitySettingsDocument';
import { hasImageAsset } from './mapping/hasImageAsset';
import { isFacetSlug } from './mapping/isFacetSlug';
import { toBookingOffer } from './mapping/toBookingOffer';
import { toBrands } from './mapping/toBrands';
import { toFacet } from './mapping/toFacet';
import { toHome } from './mapping/toHome';
import { toObra } from './mapping/toObra';
import { toPrint } from './mapping/toPrint';
import { toPrintsContent } from './mapping/toPrintsContent';
import { toSchedulingSettings } from './mapping/toSchedulingSettings';
import { toSeries } from './mapping/toSeries';
import { toSettings } from './mapping/toSettings';
import { beforeAfterQuery } from './queries/beforeAfterQuery';
import { bookingOffersQuery } from './queries/bookingOffersQuery';
import { brandPackagesQuery } from './queries/brandPackagesQuery';
import { brandsQuery } from './queries/brandsQuery';
import { facetsQuery } from './queries/facetsQuery';
import { homeQuery } from './queries/homeQuery';
import { obraQuery } from './queries/obraQuery';
import { printsPageQuery } from './queries/printsPageQuery';
import { printsQuery } from './queries/printsQuery';
import { schedulingQuery } from './queries/schedulingQuery';
import { seriesQuery } from './queries/seriesQuery';
import { settingsQuery } from './queries/settingsQuery';
import type { SanityClientPort } from './SanityClientPort';
import { SanityDocumentNotFoundError } from './SanityDocumentNotFoundError';

export class SanityContentRepository implements ContentRepository {
  constructor(private readonly client: SanityClientPort) {}

  async getSettings(): Promise<SiteSettings> {
    return toSettings(await this.singleton<SanitySettingsDocument>(settingsQuery, 'ajustes'));
  }

  async getHome(): Promise<HomeContent> {
    return toHome(await this.singleton<SanityHomeDocument>(homeQuery, 'paginaInicio'));
  }

  async getFacets(): Promise<Facet[]> {
    const documents = await this.client.fetch<SanityFacetDocument[]>(facetsQuery);
    return documents.filter((document) => isFacetSlug(document.slug)).map(toFacet);
  }

  async getBrands(): Promise<BrandsContent> {
    const [page, packages, pairs] = await Promise.all([
      this.singleton<SanityBrandsDocument>(brandsQuery, 'paginaMarcas'),
      this.client.fetch<SanityBrandPackageDocument[]>(brandPackagesQuery),
      this.client.fetch<SanityBeforeAfterDocument[]>(beforeAfterQuery),
    ]);
    return toBrands(page, packages, pairs);
  }

  async getObra(): Promise<ObraContent> {
    const [page, prints] = await Promise.all([
      this.singleton<SanityObraDocument>(obraQuery, 'paginaObra'),
      this.getPrints(),
    ]);
    return toObra(page, prints);
  }

  async getSeries(): Promise<Series[]> {
    const documents = await this.client.fetch<SanitySeriesDocument[]>(seriesQuery);
    return documents.map(toSeries);
  }

  async getPrints(): Promise<Print[]> {
    const documents = await this.client.fetch<SanityPrintDocument[]>(printsQuery);
    return documents.filter((document) => hasImageAsset(document.foto)).map(toPrint);
  }

  async getPrintsContent(): Promise<PrintsContent> {
    return toPrintsContent(await this.singleton<SanityPrintsPageDocument>(printsPageQuery, 'paginaCopias'));
  }

  async getBookingOffers(): Promise<BookingOffer[]> {
    const documents = await this.client.fetch<SanityBookingOfferDocument[]>(bookingOffersQuery);
    return documents.flatMap((document) => toBookingOffer(document) ?? []);
  }

  async getSchedulingSettings(): Promise<SchedulingSettings> {
    return toSchedulingSettings(await this.client.fetch<SanitySchedulingDocument | null>(schedulingQuery));
  }

  private async singleton<T>(query: string, documentId: string): Promise<T> {
    const document = await this.client.fetch<T | null>(query);
    if (document === null) {
      throw new SanityDocumentNotFoundError(documentId);
    }
    return document;
  }
}
