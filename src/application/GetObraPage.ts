import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';
import type { ObraPageData } from './results/ObraPageData';

export class GetObraPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(locale: Locale): Promise<ObraPageData> {
    const [obra, series, settings] = await Promise.all([
      this.repository.getObra(locale),
      this.repository.getSeries(locale),
      this.repository.getSettings(locale),
    ]);
    return { obra, series, settings };
  }
}
