import type { Locale } from '../../src/domain/Locale';

export const reservedSeriesSlugs: Record<Locale, readonly string[]> = {
  es: ['copias'],
  en: ['prints'],
  pt: ['copias'],
};

export const seriesSlugProblem = (slug: string | undefined, locale: Locale): string | true =>
  slug !== undefined && reservedSeriesSlugs[locale].includes(slug) ? 'Esa dirección está reservada para la tienda de copias.' : true;
