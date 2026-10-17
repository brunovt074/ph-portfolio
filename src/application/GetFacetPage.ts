import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';
import type { FacetSlug } from '@/domain/FacetSlug';
import { locateFacet } from './locateFacet';
import type { FacetPageData } from './results/FacetPageData';

export class GetFacetPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(locale: Locale, slug: FacetSlug): Promise<FacetPageData> {
    const [facets, settings, texts] = await Promise.all([
      this.repository.getFacets(locale),
      this.repository.getSettings(locale),
      this.repository.getTexts(locale),
    ]);
    return { ...locateFacet(facets, slug, locale, texts.nav.obra), settings };
  }
}
