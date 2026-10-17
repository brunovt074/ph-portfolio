import type { ContentRepository } from '@/domain/ContentRepository';
import type { HomePageData } from './results/HomePageData';

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
