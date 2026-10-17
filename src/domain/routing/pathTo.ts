import { defaultLocale, type Locale } from '../Locale';
import type { RouteTarget } from './RouteTarget';
import { routeSegments } from './routeSegments';

const prefixOf = (locale: Locale): string => (locale === defaultLocale ? '' : `/${locale}`);

const basePath = (locale: Locale, target: RouteTarget): string => {
  const prefix = prefixOf(locale);
  if (target.route === 'serie') return `${prefix}/${routeSegments.obraBase[locale]}/${target.slug}`;
  if (target.route === 'home') return `${prefix}/`;
  return `${prefix}/${routeSegments[target.route][locale]}`;
};

export const pathTo = (locale: Locale, target: RouteTarget): string => {
  const query = 'query' in target && target.query ? new URLSearchParams(target.query).toString() : '';
  const queryPart = query ? `?${query}` : '';
  const hashPart = target.hash ? `#${target.hash}` : '';
  return `${basePath(locale, target)}${queryPart}${hashPart}`;
};
