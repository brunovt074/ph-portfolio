import type { ContentRepository } from '@/domain/ContentRepository';
import type { Facet } from '@/domain/Facet';
import type { HomeContent } from '@/domain/HomeContent';
import type { SiteSettings } from '@/domain/SiteSettings';

export interface HomePageData {
  home: HomeContent;
  facets: Facet[];
  settings: SiteSettings;
}

export class GetHomePage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(): Promise<HomePageData> {
    const [home, facets, settings] = await Promise.all([
      this.repository.getHome(),
      this.repository.getFacets(),
      this.repository.getSettings(),
    ]);
    return { home, facets, settings };
  }
}
