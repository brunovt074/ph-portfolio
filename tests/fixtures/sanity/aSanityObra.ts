import type { SanityObraDocument } from '@/infrastructure/sanity/documents/SanityObraDocument';
import type { SanityPrintDocument } from '@/infrastructure/sanity/documents/SanityPrintDocument';
import type { SanityPrintsPageDocument } from '@/infrastructure/sanity/documents/SanityPrintsPageDocument';
import type { SanitySeriesDocument } from '@/infrastructure/sanity/documents/SanitySeriesDocument';
import { aSanityPhoto } from './aSanityPhoto';
import { aSanityTitle } from './aSanityTitle';

export const aSanityObra = (): SanityObraDocument => ({
  aperturaFoto: aSanityPhoto({ id: 'foto-au05', facets: [] }),
  aperturaSerieNumero: 'I',
  aperturaSerieTitulo: 'Oficios',
  aperturaLeyenda: aSanityTitle(['Sin título', true], [', [AÑO]']),
  frase: 'Una bitácora de mi trabajo.',
  seriesTitulo: 'Series',
  sobreTitulo: aSanityTitle(['Sobre la '], ['obra', true]),
  muestrasTitulo: 'Muestras y publicaciones',
  copiasTitulo: aSanityTitle(['Copias '], ['de autor', true]),
  copiasBajada: 'Ediciones limitadas.',
  copiasCta: 'Ver copias disponibles',
  bandaTitulo: aSanityTitle(['Esta serie está disponible como '], ['copias de autor', true]),
  bandaCta: 'Ver copias',
});

export const aSanitySeries = (overrides: Partial<SanitySeriesDocument> = {}): SanitySeriesDocument => ({
  numero: 'I',
  slug: 'oficios',
  titulo: 'Oficios',
  tituloVisible: aSanityTitle(['Ofi'], ['cios', true]),
  anios: '[AÑOS]',
  lineaCuratorial: 'Gente trabajando.',
  textoCuratorial: '[Texto curatorial de la serie]',
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
  serie: { numero: 'I', slug: 'oficios', titulo: 'Oficios' },
  ...overrides,
});

export const aSanityPrintsPage = (overrides: Partial<SanityPrintsPageDocument> = {}): SanityPrintsPageDocument => ({
  titulo: aSanityTitle(['Copias '], ['de autor', true]),
  bajada: 'Fotografías en ediciones limitadas.',
  cta: 'Consultar esta copia',
  etiquetaEdicion: 'Edición de {edicion} · quedan {disponibles}',
  info: [{ titulo: 'Impresión', descripcion: '[Papel y técnica de impresión]' }],
  ...overrides,
});
