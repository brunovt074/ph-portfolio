import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';
import { locateFacet } from './locateFacet';
import type { BrandsPageData } from './results/BrandsPageData';

export class GetBrandsPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(locale: Locale): Promise<BrandsPageData> {
    const [facets, brands, settings, texts] = await Promise.all([
      this.repository.getFacets(locale),
      this.repository.getBrands(locale),
      this.repository.getSettings(locale),
      this.repository.getTexts(locale),
    ]);
    return { ...locateFacet(facets, 'marcas', locale, texts.nav.obra), brands, settings };
  }
}
