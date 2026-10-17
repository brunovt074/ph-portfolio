import { defaultLocale, type Locale } from '../Locale';
import { localeFromPath } from './localeFromPath';

export const localeFromReferer = (referer: string | null): Locale => {
  if (referer === null) return defaultLocale;
  try {
    return localeFromPath(new URL(referer).pathname);
  } catch {
    return defaultLocale;
  }
};
