import type { ContentRepository } from '@/domain/ContentRepository';
import type { ObraPageData } from './results/ObraPageData';

export class GetObraPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(): Promise<ObraPageData> {
    const [obra, series, settings] = await Promise.all([
      this.repository.getObra(),
      this.repository.getSeries(),
      this.repository.getSettings(),
    ]);
    return { obra, series, settings };
  }
}
