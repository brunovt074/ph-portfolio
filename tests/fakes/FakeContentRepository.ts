import type { BrandsContent } from '@/domain/BrandsContent';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { Facet } from '@/domain/Facet';
import type { HomeContent } from '@/domain/HomeContent';
import type { ObraContent } from '@/domain/ObraContent';
import type { Print } from '@/domain/Print';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { Series } from '@/domain/Series';
import type { SiteSettings } from '@/domain/SiteSettings';
import { aBrands } from '../fixtures/aBrands';
import { allFacets } from '../fixtures/aFacet';
import { aHome } from '../fixtures/aHome';
import { anObra } from '../fixtures/anObra';
import { aPrintsContent } from '../fixtures/aPrintsContent';
import { allSeries } from '../fixtures/aSeries';
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
      ...overrides,
    };
  }

  async getSettings(): Promise<SiteSettings> {
    return this.data.settings;
  }

  async getHome(): Promise<HomeContent> {
    return this.data.home;
  }

  async getFacets(): Promise<Facet[]> {
    return this.data.facets;
  }

  async getBrands(): Promise<BrandsContent> {
    return this.data.brands;
  }

  async getObra(): Promise<ObraContent> {
    return this.data.obra;
  }

  async getSeries(): Promise<Series[]> {
    return this.data.series;
  }

  async getPrints(): Promise<Print[]> {
    return this.data.prints;
  }

  async getPrintsContent(): Promise<PrintsContent> {
    return this.data.printsContent;
  }
}
