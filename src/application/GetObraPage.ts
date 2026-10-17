import type { ContentRepository } from '@/domain/ContentRepository';
import type { ObraContent } from '@/domain/ObraContent';
import type { Series } from '@/domain/Series';
import type { SiteSettings } from '@/domain/SiteSettings';

export interface ObraPageData {
  obra: ObraContent;
  series: Series[];
  settings: SiteSettings;
}

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
