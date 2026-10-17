import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';
import type { HomePageData } from './results/HomePageData';

export class GetHomePage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(locale: Locale): Promise<HomePageData> {
    const [home, facets, settings] = await Promise.all([
      this.repository.getHome(locale),
      this.repository.getFacets(locale),
      this.repository.getSettings(locale),
    ]);
    return { home, facets, settings };
  }
}
