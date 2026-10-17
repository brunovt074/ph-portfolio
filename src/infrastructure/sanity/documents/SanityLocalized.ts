import type { Locale } from '@/domain/Locale';

export type SanityLocalized<T> = Partial<Record<Locale, T | null>> | T;
