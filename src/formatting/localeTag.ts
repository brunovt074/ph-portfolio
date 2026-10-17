import type { Locale } from '@/domain/Locale';

const tags: Record<Locale, string> = { es: 'es-AR', en: 'en', pt: 'pt-BR' };

export const localeTagOf = (locale: Locale): string => tags[locale];
