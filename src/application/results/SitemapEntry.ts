import type { Locale } from '@/domain/Locale';

export interface SitemapEntry {
  path: string;
  alternates: Partial<Record<Locale | 'x-default', string>>;
}
