import { defaultLocale, isLocale, type Locale } from '../Locale';

export const localeFromPath = (pathname: string): Locale => {
  const first = pathname.split('/')[1];
  return isLocale(first) ? first : defaultLocale;
};
