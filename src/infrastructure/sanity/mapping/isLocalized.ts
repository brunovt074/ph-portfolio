import type { Locale } from '@/domain/Locale';

export const isLocalized = (value: unknown): value is Partial<Record<Locale, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) && !('current' in value);
