import type { Facet } from '@/domain/Facet';
import type { HomeContent } from '@/domain/HomeContent';
import type { SiteSettings } from '@/domain/SiteSettings';

export interface HomePageData {
  home: HomeContent;
  facets: Facet[];
  settings: SiteSettings;
}
