import type { InfoItem } from '@/domain/InfoItem';
import type { Locale } from '@/domain/Locale';
import type { SanityInfoItem } from '../documents/SanityInfoItem';
import { localizeText } from './localize';

export const toInfoItem = (item: SanityInfoItem, locale: Locale): InfoItem => ({
  title: localizeText(item.titulo, locale),
  description: localizeText(item.descripcion, locale),
});
