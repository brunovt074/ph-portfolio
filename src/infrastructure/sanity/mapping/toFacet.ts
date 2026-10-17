import type { Facet } from '@/domain/Facet';
import type { FacetSlug } from '@/domain/FacetSlug';
import type { SanityFacetDocument } from '../documents/SanityFacetDocument';
import { toPhotos } from './toPhoto';
import { toRichTitle } from './toRichTitle';
import { toService } from './toService';

export const toFacet = (document: SanityFacetDocument): Facet => ({
  slug: document.slug as FacetSlug,
  number: document.numero,
  name: document.nombre,
  title: toRichTitle(document.titulo),
  lead: document.lead,
  indexDescription: document.indexDescription,
  cover: toPhotos(document.portada),
  gallery: toPhotos(document.galeria),
  services: (document.servicios ?? []).map(toService),
  ...(document.quote != null && { quote: toRichTitle(document.quote) }),
  ctaText: document.ctaTexto,
  ctaButton: document.ctaButton,
});
