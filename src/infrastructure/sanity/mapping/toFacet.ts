import type { Facet } from '@/domain/Facet';
import type { FacetSlug } from '@/domain/FacetSlug';
import type { Locale } from '@/domain/Locale';
import type { SanityFacetDocument } from '../documents/SanityFacetDocument';
import { localizeText } from './localize';
import { toPhotos } from './toPhoto';
import { toRichTitle } from './toRichTitle';
import { toService } from './toService';
import { translationsOf } from './translationsOf';

export const toFacet = (document: SanityFacetDocument, locale: Locale): Facet => ({
  slug: document.slug as FacetSlug,
  number: document.numero,
  name: localizeText(document.nombre, locale),
  title: toRichTitle(document.titulo, locale),
  lead: localizeText(document.lead, locale),
  indexDescription: localizeText(document.indexDescription, locale),
  cover: toPhotos(document.portada, locale),
  gallery: toPhotos(document.galeria, locale),
  services: (document.servicios ?? []).map((service) => toService(service, locale)),
  ...(document.quote != null && { quote: toRichTitle(document.quote, locale) }),
  ctaText: localizeText(document.ctaTexto, locale),
  ctaButton: localizeText(document.ctaButton, locale),
  translations: translationsOf(document.titulo, document.lead),
});
