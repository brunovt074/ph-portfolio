import type { ContentRepository } from '@/domain/ContentRepository';
import type { SiteSettings } from '@/domain/SiteSettings';

export class GetSiteSettings {
  constructor(private readonly repository: ContentRepository) {}

  execute(): Promise<SiteSettings> {
    return this.repository.getSettings();
  }
}
