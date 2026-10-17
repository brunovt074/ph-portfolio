import type { Locale } from '../Locale';
import type { RouteKey } from './RouteKey';

export interface LocalizedPath {
  locale: Locale;
  path: string;
  route: RouteKey;
  slug?: string;
}
