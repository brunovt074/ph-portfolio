import type { ContentRepository } from '@/domain/ContentRepository';

export class ListSeriesSlugs {
  constructor(private readonly repository: ContentRepository) {}

  async execute(): Promise<string[]> {
    const series = await this.repository.getSeries();
    return series.map((item) => item.slug);
  }
}
