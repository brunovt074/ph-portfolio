import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';
import type { PrintsPageData } from './results/PrintsPageData';

export class GetPrintsPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(locale: Locale): Promise<PrintsPageData> {
    const [prints, content, settings] = await Promise.all([
      this.repository.getPrints(locale),
      this.repository.getPrintsContent(locale),
      this.repository.getSettings(locale),
    ]);
    return { prints: prints.filter((print) => print.active), content, settings };
  }
}
