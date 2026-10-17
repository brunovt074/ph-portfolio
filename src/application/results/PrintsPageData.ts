import type { Print } from '@/domain/Print';
import type { PrintsContent } from '@/domain/PrintsContent';
import type { SiteSettings } from '@/domain/SiteSettings';

export interface PrintsPageData {
  prints: Print[];
  content: PrintsContent;
  settings: SiteSettings;
}
