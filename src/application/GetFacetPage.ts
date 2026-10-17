import type { ContentRepository } from '@/domain/ContentRepository';
import type { FacetSlug } from '@/domain/FacetSlug';
import type { SiteSettings } from '@/domain/SiteSettings';
import { locateFacet, type LocatedFacet } from './locateFacet';

export interface FacetPageData extends LocatedFacet {
  settings: SiteSettings;
}

export class GetFacetPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(slug: FacetSlug): Promise<FacetPageData> {
    const [facets, settings] = await Promise.all([this.repository.getFacets(), this.repository.getSettings()]);
    return { ...locateFacet(facets, slug), settings };
  }
}
