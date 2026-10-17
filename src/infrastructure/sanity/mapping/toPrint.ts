import type { Locale } from '@/domain/Locale';
import type { Print } from '@/domain/Print';
import type { SanityPrintDocument } from '../documents/SanityPrintDocument';
import { localizeText } from './localize';
import { toPhoto } from './toPhoto';
import { toSlug } from './toSlug';

export const toPrint = (document: SanityPrintDocument, locale: Locale): Print => ({
  id: document.id,
  photo: toPhoto(document.foto, locale),
  series: {
    number: document.serie.numero,
    slug: toSlug(document.serie.slug, locale),
    title: localizeText(document.serie.titulo, locale),
  },
  edition: document.edicion,
  available: document.disponibles ?? null,
  sizes: (document.tamanos ?? []).map((size) => ({ size: size.medida, price: size.precio })),
  active: document.activa ?? false,
});
