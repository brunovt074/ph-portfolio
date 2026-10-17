import type { ContentRepository } from '@/domain/ContentRepository';
import type { FacetSlug } from '@/domain/FacetSlug';
import { locateFacet } from './locateFacet';
import type { FacetPageData } from './results/FacetPageData';

export class GetFacetPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(slug: FacetSlug): Promise<FacetPageData> {
    const [facets, settings] = await Promise.all([this.repository.getFacets(), this.repository.getSettings()]);
    return { ...locateFacet(facets, slug), settings };
  }
}
