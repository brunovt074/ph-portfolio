import type { SanityBeforeAfterDocument } from '@/infrastructure/sanity/documents/SanityBeforeAfterDocument';
import type { SanityBrandPackageDocument } from '@/infrastructure/sanity/documents/SanityBrandPackageDocument';
import type { SanityBrandsDocument } from '@/infrastructure/sanity/documents/SanityBrandsDocument';
import { aSanityPhoto } from './aSanityPhoto';
import { aSanityTitle } from './aSanityTitle';

export const aSanityBrands = (): SanityBrandsDocument => ({
  ctaCabecera: 'Pedir presupuesto',
  rubrosTitulo: 'Rubros',
  rubros: [{ titulo: 'Gastronomía', descripcion: 'Platos y cartas.', foto: aSanityPhoto({ id: 'foto-mk03', facets: ['marcas'] }) }],
  masTrabajosTitulo: 'Más trabajos',
  antesDespuesTitulo: aSanityTitle(['El '], ['retoque', true], [' hace la diferencia']),
  antesDespuesBajada: 'Arrastrá para comparar.',
  procesoTitulo: aSanityTitle(['Cómo '], ['trabajamos', true]),
  pasos: [{ titulo: 'Brief', descripcion: 'Me contás tu marca.' }],
  paquetesTitulo: 'Paquetes',
  paquetesCta: 'Elegir este paquete',
});

export const aSanityPackage = (overrides: Partial<SanityBrandPackageDocument> = {}): SanityBrandPackageDocument => ({
  nombre: 'Esencial',
  precio: '[PRECIO]',
  items: ['Hasta 10 productos'],
  destacado: null,
  orden: 1,
  ...overrides,
});

export const aSanityBeforeAfter = (overrides: Partial<SanityBeforeAfterDocument> = {}): SanityBeforeAfterDocument => ({
  id: 'antesDespues-serum',
  alt: 'Sérum facial sobre agua lila, antes y después del retoque',
  provisorio: true,
  antes: aSanityPhoto().image,
  despues: aSanityPhoto({ id: 'otra' }).image,
  ...overrides,
});
