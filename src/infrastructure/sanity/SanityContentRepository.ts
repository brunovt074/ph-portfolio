import type { BrandsContent } from '@/domain/BrandsContent';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { Facet } from '@/domain/Facet';
import type { HomeContent } from '@/domain/HomeContent';
import type { ObraContent } from '@/domain/ObraContent';
import type { Print } from '@/domain/Print';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { Series } from '@/domain/Series';
import type { SiteSettings } from '@/domain/SiteSettings';
import type { SanityBeforeAfterDocument } from './documents/SanityBeforeAfterDocument';
import type { SanityBrandPackageDocument } from './documents/SanityBrandPackageDocument';
import type { SanityBrandsDocument } from './documents/SanityBrandsDocument';
import type { SanityFacetDocument } from './documents/SanityFacetDocument';
import type { SanityHomeDocument } from './documents/SanityHomeDocument';
import type { SanityObraDocument } from './documents/SanityObraDocument';
import type { SanityPrintDocument } from './documents/SanityPrintDocument';
import type { SanityPrintsPageDocument } from './documents/SanityPrintsPageDocument';
import type { SanitySeriesDocument } from './documents/SanitySeriesDocument';
import type { SanitySettingsDocument } from './documents/SanitySettingsDocument';
import { hasImageAsset } from './mapping/hasImageAsset';
import { isFacetSlug } from './mapping/isFacetSlug';
import { toBrands } from './mapping/toBrands';
import { toFacet } from './mapping/toFacet';
import { toHome } from './mapping/toHome';
import { toObra } from './mapping/toObra';
import { toPrint } from './mapping/toPrint';
import { toPrintsContent } from './mapping/toPrintsContent';
import { toSeries } from './mapping/toSeries';
import { toSettings } from './mapping/toSettings';
import { beforeAfterQuery } from './queries/beforeAfterQuery';
import { brandPackagesQuery } from './queries/brandPackagesQuery';
import { brandsQuery } from './queries/brandsQuery';
import { facetsQuery } from './queries/facetsQuery';
import { homeQuery } from './queries/homeQuery';
import { obraQuery } from './queries/obraQuery';
import { printsPageQuery } from './queries/printsPageQuery';
import { printsQuery } from './queries/printsQuery';
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

  private async singleton<T>(query: string, documentId: string): Promise<T> {
    const document = await this.client.fetch<T | null>(query);
    if (document === null) {
      throw new SanityDocumentNotFoundError(documentId);
    }
    return document;
  }
}
