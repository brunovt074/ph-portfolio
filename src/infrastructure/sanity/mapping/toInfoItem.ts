import type { InfoItem } from '@/domain/InfoItem';
import type { SanityInfoItem } from '../documents/SanityInfoItem';

export const toInfoItem = (item: SanityInfoItem): InfoItem => ({
  title: item.titulo,
  description: item.descripcion,
});
