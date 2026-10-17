import type { Locale } from '@/domain/Locale';
import type { SanityLocalized } from '../documents/SanityLocalized';
import type { SanitySlug } from '../documents/SanitySlug';
import { localize } from './localize';

export const toSlug = (slug: SanityLocalized<SanitySlug> | null | undefined, locale: Locale): string =>
  localize(slug, locale)?.current ?? '';
