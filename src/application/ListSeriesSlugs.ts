import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';

export class ListSeriesSlugs {
  constructor(private readonly repository: ContentRepository) {}

  async execute(locale: Locale): Promise<string[]> {
    const series = await this.repository.getSeries(locale);
    return series.map((item) => item.slug);
  }
}
