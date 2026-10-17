import type { ObraContent } from '@/domain/ObraContent';
import type { Series } from '@/domain/Series';
import type { SiteSettings } from '@/domain/SiteSettings';

export interface ObraPageData {
  obra: ObraContent;
  series: Series[];
  settings: SiteSettings;
}
