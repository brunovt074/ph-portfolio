import type { FacetSlug } from '@/domain/FacetSlug';
import type { Locale } from '@/domain/Locale';
import type { Photo } from '@/domain/Photo';
import type { SanityPhotoDocument } from '../documents/SanityPhotoDocument';
import { hasImageAsset } from './hasImageAsset';
import { isFacetSlug } from './isFacetSlug';
import { localize, localizeText } from './localize';
import { toPhotoAsset } from './toPhotoAsset';

const facetOf = (document: SanityPhotoDocument): FacetSlug | 'obra' => {
  return (document.facets ?? []).find(isFacetSlug) ?? 'obra';
};

export const toPhoto = (document: SanityPhotoDocument, locale: Locale): Photo => {
  const title = localize(document.titulo, locale);
  return {
    id: document.id.replace(/^foto-/, ''),
    asset: toPhotoAsset(document.image),
    alt: localizeText(document.alt, locale),
    facet: facetOf(document),
    featured: document.destacada ?? false,
    ...(title !== undefined && { title }),
    ...(document.tituloProvisorio != null && { provisionalTitle: document.tituloProvisorio }),
    ...(document.lugar != null && { place: document.lugar }),
    ...(document.anio != null && { year: document.anio }),
  };
};

export const toPhotos = (documents: (SanityPhotoDocument | null)[] | null | undefined, locale: Locale): Photo[] =>
  (documents ?? [])
    .filter((document): document is SanityPhotoDocument => document !== null && hasImageAsset(document))
    .map((document) => toPhoto(document, locale));
