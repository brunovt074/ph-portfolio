import type { BrandsContent } from '@/domain/BrandsContent';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { SiteSettings } from '@/domain/SiteSettings';
import { locateFacet, type LocatedFacet } from './locateFacet';

export interface BrandsPageData extends LocatedFacet {
  brands: BrandsContent;
  settings: SiteSettings;
}

export class GetBrandsPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(): Promise<BrandsPageData> {
    const [facets, brands, settings] = await Promise.all([
      this.repository.getFacets(),
      this.repository.getBrands(),
      this.repository.getSettings(),
    ]);
    return { ...locateFacet(facets, 'marcas'), brands, settings };
  }
}
