import type { Locale } from '@/domain/Locale';
import type { SiteTextGroup, SiteTexts } from '@/domain/SiteTexts';

export type SiteTextsOverrides = {
  [G in SiteTextGroup]?: { [K in keyof SiteTexts[G]]?: Partial<Record<Locale, string>> | null } | null;
};
