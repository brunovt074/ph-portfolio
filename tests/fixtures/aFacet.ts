import type { Facet } from '@/domain/Facet';
import type { FacetSlug } from '@/domain/FacetSlug';
import { aPhoto } from './aPhoto';

export const aFacet = (slug: FacetSlug, number: number, name: string): Facet => ({
  slug,
  number,
  name,
  title: [{ text: name, italic: false }],
  lead: `Lead de ${name}`,
  indexDescription: `Descripción de ${name}`,
  cover: [aPhoto()],
  gallery: [aPhoto()],
  services: [],
  ctaText: 'Contanos',
  ctaButton: 'Reservar',
});

export const allFacets = (): Facet[] => [
  aFacet('editorial', 1, 'Editorial & Moda'),
  aFacet('retratos', 2, 'Retratos & Estudio'),
  aFacet('marcas', 3, 'Marcas'),
  aFacet('eventos', 4, 'Eventos & Carnaval'),
];
