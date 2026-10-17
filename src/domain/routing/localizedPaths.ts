import type { Locale } from '../Locale';
import { DuplicateRouteError } from './DuplicateRouteError';
import type { LocalizedPath } from './LocalizedPath';
import { pathTo } from './pathTo';
import type { StaticRouteKey } from './StaticRouteKey';

const staticRoutes: readonly StaticRouteKey[] = ['home', 'editorial', 'retratos', 'marcas', 'eventos', 'obra', 'copias', 'reservas'];

export const localizedPaths = (locale: Locale, seriesSlugs: readonly string[]): LocalizedPath[] => {
  const entries: LocalizedPath[] = [
    ...staticRoutes.map((route): LocalizedPath => ({ locale, path: pathTo(locale, { route }), route })),
    ...seriesSlugs.map((slug): LocalizedPath => ({ locale, path: pathTo(locale, { route: 'serie', slug }), route: 'serie', slug })),
  ];
  const seen = new Set<string>();
  for (const entry of entries) {
    if (seen.has(entry.path)) throw new DuplicateRouteError(entry.path);
    seen.add(entry.path);
  }
  return entries;
};
