import type { SanityObraDocument } from '@/infrastructure/sanity/documents/SanityObraDocument';
import type { SanityPrintDocument } from '@/infrastructure/sanity/documents/SanityPrintDocument';
import type { SanityPrintsPageDocument } from '@/infrastructure/sanity/documents/SanityPrintsPageDocument';
import type { SanitySeriesDocument } from '@/infrastructure/sanity/documents/SanitySeriesDocument';
import { aSanityPhoto } from './aSanityPhoto';
import { aSanityTitle } from './aSanityTitle';

export const aSanityObra = (overrides: Partial<SanityObraDocument> = {}): SanityObraDocument => ({
  aperturaFoto: aSanityPhoto({ id: 'foto-au05', facets: [] }),
  aperturaSerieNumero: { es: 'I' },
  aperturaSerieTitulo: { es: 'Oficios' },
  aperturaLeyenda: { es: aSanityTitle(['Sin título', true], [', [AÑO]']) },
  frase: { es: 'Una bitácora de mi trabajo.' },
  seriesTitulo: { es: 'Series' },
  sobreTitulo: { es: aSanityTitle(['Sobre la '], ['obra', true]) },
  muestrasTitulo: { es: 'Muestras y publicaciones' },
  copiasTitulo: { es: aSanityTitle(['Copias '], ['de autor', true]) },
  copiasBajada: { es: 'Ediciones limitadas.' },
  copiasCta: { es: 'Ver copias disponibles' },
  bandaTitulo: { es: aSanityTitle(['Esta serie está disponible como '], ['copias de autor', true]) },
  bandaCta: { es: 'Ver copias' },
  ...overrides,
});

export const aSanitySeries = (overrides: Partial<SanitySeriesDocument> = {}): SanitySeriesDocument => ({
  numero: 'I',
  slug: { es: { current: 'oficios' } },
  titulo: { es: 'Oficios' },
  tituloVisible: { es: aSanityTitle(['Ofi'], ['cios', true]) },
  anios: '[AÑOS]',
  lineaCuratorial: { es: 'Gente trabajando.' },
  textoCuratorial: { es: '[Texto curatorial de la serie]' },
  fotos: [
    { layout: 'centro', foto: aSanityPhoto({ id: 'foto-au01', facets: [] }) },
    { layout: 'sangre', foto: aSanityPhoto({ id: 'foto-au13', facets: [] }) },
    { layout: 'desconocido', foto: aSanityPhoto({ id: 'foto-au99', facets: [] }) },
    { layout: 'par', foto: null },
  ],
  ...overrides,
});

export const aSanityPrint = (overrides: Partial<SanityPrintDocument> = {}): SanityPrintDocument => ({
  id: 'copia-au03',
  edicion: 10,
  disponibles: null,
  activa: true,
  tamanos: [{ medida: '30 × 40 cm', precio: '[PRECIO]' }],
  foto: aSanityPhoto({ id: 'foto-au03', facets: [] }),
  serie: { numero: 'I', slug: { es: { current: 'oficios' } }, titulo: { es: 'Oficios' } },
  ...overrides,
});

export const aSanityPrintsPage = (overrides: Partial<SanityPrintsPageDocument> = {}): SanityPrintsPageDocument => ({
  titulo: { es: aSanityTitle(['Copias '], ['de autor', true]) },
  bajada: { es: 'Fotografías en ediciones limitadas.' },
  cta: { es: 'Consultar esta copia' },
  etiquetaEdicion: { es: 'Edición de {edicion} · quedan {disponibles}' },
  info: [{ titulo: { es: 'Impresión' }, descripcion: { es: '[Papel y técnica de impresión]' } }],
  ...overrides,
});
