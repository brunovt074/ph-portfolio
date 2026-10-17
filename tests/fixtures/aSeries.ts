import type { Series } from '@/domain/Series';
import { aPhoto } from './aPhoto';

export const aSeries = (overrides: Partial<Series> = {}): Series => {
  const slug = overrides.slug ?? 'oficios';
  const title = overrides.title ?? 'Oficios';
  return {
    number: 'I',
    slug,
    slugs: { es: slug, en: slug, pt: slug },
    title,
    displayTitle: [{ text: title, italic: false }],
    years: '[AÑOS]',
    curatorialLine: `Línea de ${title}`,
    curatorialText: '[Texto curatorial de la serie]',
    photos: [{ photo: aPhoto({ id: 'au01', facet: 'obra' }), layout: 'center' }],
    translations: { es: true, en: false, pt: false },
    ...overrides,
  };
};

export const allSeries = (): Series[] => [
  aSeries({ number: 'I', slug: 'oficios', title: 'Oficios' }),
  aSeries({ number: 'II', slug: 'geometrias', title: 'Geometrías' }),
  aSeries({ number: 'III', slug: 'lo-que-queda', title: 'Lo que queda' }),
  aSeries({ number: 'IV', slug: 'viajes-en-color', title: 'Viajes en color' }),
];
