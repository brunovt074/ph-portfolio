import type { SanityFacetDocument } from '@/infrastructure/sanity/documents/SanityFacetDocument';
import { aSanityPhoto } from './aSanityPhoto';
import { aSanityTitle } from './aSanityTitle';

export const aSanityFacet = (overrides: Partial<SanityFacetDocument> = {}): SanityFacetDocument => ({
  slug: 'retratos',
  numero: 2,
  nombre: 'Retratos & Estudio',
  titulo: aSanityTitle(['Personas, '], ['sin pose', true]),
  lead: 'Sesiones en estudio o en tu espacio.',
  indexDescription: 'Sesiones personales, maternidad y familias.',
  quote: aSanityTitle(['Creemos que tenemos mucho '], ['tiempo', true], ['. Las fotos nos recuerdan que no.']),
  ctaTexto: 'Reservá tu sesión',
  ctaButton: 'Reservar sesión',
  portada: [aSanityPhoto({ id: 'foto-rt02', facets: ['retratos'] }), null],
  galeria: [aSanityPhoto({ id: 'foto-rt01', facets: ['retratos'] })],
  servicios: [
    { titulo: 'Retrato personal', descripcion: 'Una sesión para vos.', precio: '[PRECIO]' },
    { titulo: 'Marca personal', descripcion: null, precio: null },
  ],
  ...overrides,
});
