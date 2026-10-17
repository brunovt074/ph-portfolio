import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';
import type { SiteTexts } from '@/domain/SiteTexts';

export class GetSiteTexts {
  constructor(private readonly repository: ContentRepository) {}

  execute(locale: Locale): Promise<SiteTexts> {
    return this.repository.getTexts(locale);
  }
}
