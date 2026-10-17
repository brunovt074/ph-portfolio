import type { ContentRepository } from '@/domain/ContentRepository';
import type { PrintsPageData } from './results/PrintsPageData';

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
