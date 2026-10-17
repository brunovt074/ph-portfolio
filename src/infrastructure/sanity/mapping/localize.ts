import { defaultLocale, type Locale } from '@/domain/Locale';
import type { SanityLocalized } from '../documents/SanityLocalized';
import { hasContent } from './hasContent';
import { isLocalized } from './isLocalized';

export const localize = <T>(value: SanityLocalized<T> | null | undefined, locale: Locale): T | undefined => {
  if (value === null || value === undefined) return undefined;
  if (!isLocalized(value)) return value as T;
  const translated = value[locale];
  const chosen = hasContent(translated) ? translated : value[defaultLocale];
  return (chosen ?? undefined) as T | undefined;
};

export const localizeText = (value: SanityLocalized<string> | null | undefined, locale: Locale): string =>
  localize(value, locale) ?? '';

export const localizeList = <T>(value: SanityLocalized<T[]> | null | undefined, locale: Locale): T[] =>
  localize(value, locale) ?? [];
