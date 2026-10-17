import type { Print } from '@/domain/Print';
import type { SanityPrintDocument } from '../documents/SanityPrintDocument';
import { toPhoto } from './toPhoto';

export const toPrint = (document: SanityPrintDocument): Print => ({
  id: document.id,
  photo: toPhoto(document.foto),
  series: { number: document.serie.numero, slug: document.serie.slug, title: document.serie.titulo },
  edition: document.edicion,
  available: document.disponibles ?? null,
  sizes: (document.tamanos ?? []).map((size) => ({ size: size.medida, price: size.precio })),
  active: document.activa ?? false,
});
