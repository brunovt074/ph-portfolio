import type { Print } from '@/domain/Print';
import { aPhoto } from './aPhoto';

export const aPrint = (id: string, seriesSlug: string, active = true): Print => ({
  id,
  photo: aPhoto({ id, facet: 'obra' }),
  series: { number: 'I', slug: seriesSlug, title: seriesSlug },
  edition: 10,
  available: null,
  sizes: [{ size: '30 × 40 cm', price: '[PRECIO]' }],
  active,
});
