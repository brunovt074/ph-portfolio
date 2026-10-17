import type { ContentRepository } from '@/domain/ContentRepository';
import type { Print } from '@/domain/Print';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { SiteSettings } from '@/domain/SiteSettings';

export interface PrintsPageData {
  prints: Print[];
  content: PrintsContent;
  settings: SiteSettings;
}

export class GetPrintsPage {
  constructor(private readonly repository: ContentRepository) {}

  async execute(): Promise<PrintsPageData> {
    const [prints, content, settings] = await Promise.all([
      this.repository.getPrints(),
      this.repository.getPrintsContent(),
      this.repository.getSettings(),
    ]);
    return { prints: prints.filter((print) => print.active), content, settings };
  }
}
