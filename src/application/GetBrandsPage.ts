import type { ContentRepository } from '@/domain/ContentRepository';
import { locateFacet } from './locateFacet';
import type { BrandsPageData } from './results/BrandsPageData';

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
