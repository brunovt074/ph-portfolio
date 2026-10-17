import { defaultLocale, locales, type Locale } from '@/domain/Locale';
import type { Translations } from '@/domain/Translations';
import type { SanityLocalized } from '../documents/SanityLocalized';
import { hasContent } from './hasContent';
import { isLocalized } from './isLocalized';

const isTranslated = (value: SanityLocalized<unknown>, locale: Locale): boolean =>
  isLocalized(value) && hasContent(value[locale]);

export const translationsOf = (...values: SanityLocalized<unknown>[]): Translations =>
  Object.fromEntries(
    locales.map((locale) => [locale, locale === defaultLocale || values.every((value) => isTranslated(value, locale))]),
  ) as Translations;
