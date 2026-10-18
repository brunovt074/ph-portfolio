export type Locale = 'es' | 'en' | 'pt';

export const locales: readonly Locale[] = ['es', 'en', 'pt'];

export const defaultLocale: Locale = 'es';

export const enabledLocales: readonly Locale[] = ['es'];

export const isLocale = (value: unknown): value is Locale => enabledLocales.some((locale) => locale === value);

export const parseLocale = (value: string | null | undefined): Locale => (isLocale(value) ? value : defaultLocale);
