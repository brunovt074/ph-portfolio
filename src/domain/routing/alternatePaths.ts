import type { Locale } from '../Locale';
import { pathTo } from './pathTo';
import type { RouteTarget } from './RouteTarget';

export const alternatePaths = (targetFor: (locale: Locale) => RouteTarget): Record<Locale, string> => ({
  es: pathTo('es', targetFor('es')),
  en: pathTo('en', targetFor('en')),
  pt: pathTo('pt', targetFor('pt')),
});
