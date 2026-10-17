import type { ContentRepository } from '@/domain/ContentRepository';
import type { Locale } from '@/domain/Locale';
import type { SiteSettings } from '@/domain/SiteSettings';

export class GetSiteSettings {
  constructor(private readonly repository: ContentRepository) {}

  execute(locale: Locale): Promise<SiteSettings> {
    return this.repository.getSettings(locale);
  }
}
