import type { SanityFacetDocument } from '@/infrastructure/sanity/documents/SanityFacetDocument';
import { aSanityPhoto } from './aSanityPhoto';
import { aSanityTitle } from './aSanityTitle';

export const aSanityFacet = (overrides: Partial<SanityFacetDocument> = {}): SanityFacetDocument => ({
  slug: 'retratos',
  numero: 2,
  nombre: { es: 'Retratos & Estudio' },
  titulo: { es: aSanityTitle(['Personas, '], ['sin pose', true]) },
  lead: { es: 'Sesiones en estudio o en tu espacio.' },
  indexDescription: { es: 'Sesiones personales, maternidad y familias.' },
  quote: { es: aSanityTitle(['Creemos que tenemos mucho '], ['tiempo', true], ['. Las fotos nos recuerdan que no.']) },
  ctaTexto: { es: 'Reservá tu sesión' },
  ctaButton: { es: 'Reservar sesión' },
  portada: [aSanityPhoto({ id: 'foto-rt02', facets: ['retratos'] }), null],
  galeria: [aSanityPhoto({ id: 'foto-rt01', facets: ['retratos'] })],
  servicios: [
    { titulo: { es: 'Retrato personal' }, descripcion: { es: 'Una sesión para vos.' }, precio: { es: '[PRECIO]' } },
    { titulo: { es: 'Marca personal' }, descripcion: null, precio: null },
  ],
  ...overrides,
});
