import type { Series } from '@/domain/Series';
import { aPhoto } from './aPhoto';

export const aSeries = (number: string, slug: string, title: string): Series => ({
  number,
  slug,
  title,
  displayTitle: [{ text: title, italic: false }],
  years: '[AÑOS]',
  curatorialLine: `Línea de ${title}`,
  curatorialText: '[Texto curatorial de la serie]',
  photos: [{ photo: aPhoto({ id: 'au01', facet: 'obra' }), layout: 'center' }],
});

export const allSeries = (): Series[] => [
  aSeries('I', 'oficios', 'Oficios'),
  aSeries('II', 'geometrias', 'Geometrías'),
  aSeries('III', 'lo-que-queda', 'Lo que queda'),
  aSeries('IV', 'viajes-en-color', 'Viajes en color'),
];
