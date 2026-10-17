import type { Locale } from '@/domain/Locale';
import { pathTo } from '@/domain/routing/pathTo';
import type { SiteTexts } from '@/domain/SiteTexts';
import type { HeaderLink } from './HeaderLink';

export type HeaderVariant = 'site' | 'obra';

const siteLinks = (locale: Locale, texts: SiteTexts): HeaderLink[] => [
  { key: 'editorial', label: texts.nav.editorial, href: pathTo(locale, { route: 'editorial' }) },
  { key: 'retratos', label: texts.nav.retratos, href: pathTo(locale, { route: 'retratos' }) },
  { key: 'marcas', label: texts.nav.marcas, href: pathTo(locale, { route: 'marcas' }) },
  { key: 'eventos', label: texts.nav.eventos, href: pathTo(locale, { route: 'eventos' }) },
  { key: 'obra', label: texts.nav.obra, href: pathTo(locale, { route: 'obra' }) },
];

const obraLinks = (locale: Locale, texts: SiteTexts): HeaderLink[] => [
  { key: 'series', label: texts.nav.series, href: pathTo(locale, { route: 'obra', hash: 'series' }) },
  { key: 'copias', label: texts.nav.copias, href: pathTo(locale, { route: 'copias' }) },
  { key: 'sobre', label: texts.nav.aboutWork, href: pathTo(locale, { route: 'obra', hash: 'sobre' }) },
  { key: 'encargos', label: texts.nav.encargos, href: pathTo(locale, { route: 'home', hash: 'encargos' }), muted: true },
];

export const navigationLinks = (variant: HeaderVariant, locale: Locale, texts: SiteTexts): HeaderLink[] =>
  variant === 'obra' ? obraLinks(locale, texts) : siteLinks(locale, texts);
