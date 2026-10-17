import type { SanityBeforeAfterDocument } from '@/infrastructure/sanity/documents/SanityBeforeAfterDocument';
import type { SanityBrandPackageDocument } from '@/infrastructure/sanity/documents/SanityBrandPackageDocument';
import type { SanityBrandsDocument } from '@/infrastructure/sanity/documents/SanityBrandsDocument';
import { aSanityPhoto } from './aSanityPhoto';
import { aSanityTitle } from './aSanityTitle';

export const aSanityBrands = (overrides: Partial<SanityBrandsDocument> = {}): SanityBrandsDocument => ({
  ctaCabecera: { es: 'Pedir presupuesto' },
  rubrosTitulo: { es: 'Rubros' },
  rubros: [{ titulo: { es: 'Gastronomía' }, descripcion: { es: 'Platos y cartas.' }, foto: aSanityPhoto({ id: 'foto-mk03', facets: ['marcas'] }) }],
  masTrabajosTitulo: { es: 'Más trabajos' },
  antesDespuesTitulo: { es: aSanityTitle(['El '], ['retoque', true], [' hace la diferencia']) },
  antesDespuesBajada: { es: 'Arrastrá para comparar.' },
  procesoTitulo: { es: aSanityTitle(['Cómo '], ['trabajamos', true]) },
  pasos: [{ titulo: { es: 'Brief' }, descripcion: { es: 'Me contás tu marca.' } }],
  paquetesTitulo: { es: 'Paquetes' },
  paquetesCta: { es: 'Elegir este paquete' },
  ...overrides,
});

export const aSanityPackage = (overrides: Partial<SanityBrandPackageDocument> = {}): SanityBrandPackageDocument => ({
  nombre: { es: 'Esencial' },
  precio: { es: '[PRECIO]' },
  items: { es: ['Hasta 10 productos'] },
  destacado: null,
  orden: 1,
  ...overrides,
});

export const aSanityBeforeAfter = (overrides: Partial<SanityBeforeAfterDocument> = {}): SanityBeforeAfterDocument => ({
  id: 'antesDespues-serum',
  alt: { es: 'Sérum facial sobre agua lila, antes y después del retoque' },
  provisorio: true,
  antes: aSanityPhoto().image,
  despues: aSanityPhoto({ id: 'otra' }).image,
  ...overrides,
});
