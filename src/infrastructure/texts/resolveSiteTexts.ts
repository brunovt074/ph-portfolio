import type { Locale } from '@/domain/Locale';
import type { SiteTextGroup, SiteTexts } from '@/domain/SiteTexts';
import { defaultSiteTexts } from './defaults/defaultSiteTexts';
import type { SiteTextsOverrides } from './SiteTextsOverrides';

const resolveGroup = <G extends SiteTextGroup>(defaults: SiteTexts[G], overrides: SiteTextsOverrides[G], locale: Locale): SiteTexts[G] => {
  const keyed = (overrides ?? {}) as Record<string, Partial<Record<Locale, string>> | null | undefined>;
  return Object.fromEntries(
    Object.entries(defaults).map(([key, fallback]) => [key, keyed[key]?.[locale]?.trim() || fallback]),
  ) as SiteTexts[G];
};

export const resolveSiteTexts = (overrides: SiteTextsOverrides | null, locale: Locale): SiteTexts => {
  const defaults = defaultSiteTexts[locale];
  return {
    a11y: resolveGroup<'a11y'>(defaults.a11y, overrides?.a11y, locale),
    nav: resolveGroup<'nav'>(defaults.nav, overrides?.nav, locale),
    pages: resolveGroup<'pages'>(defaults.pages, overrides?.pages, locale),
    contact: resolveGroup<'contact'>(defaults.contact, overrides?.contact, locale),
    seo: resolveGroup<'seo'>(defaults.seo, overrides?.seo, locale),
    notFound: resolveGroup<'notFound'>(defaults.notFound, overrides?.notFound, locale),
  };
};
