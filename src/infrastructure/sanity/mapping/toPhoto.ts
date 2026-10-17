import type { FacetSlug } from '@/domain/FacetSlug';
import type { Photo } from '@/domain/Photo';
import type { SanityPhotoDocument } from '../documents/SanityPhotoDocument';
import { hasImageAsset } from './hasImageAsset';
import { isFacetSlug } from './isFacetSlug';
import { toPhotoAsset } from './toPhotoAsset';

const facetOf = (document: SanityPhotoDocument): FacetSlug | 'obra' => {
  return (document.facets ?? []).find(isFacetSlug) ?? 'obra';
};

export const toPhoto = (document: SanityPhotoDocument): Photo => ({
  id: document.id.replace(/^foto-/, ''),
  asset: toPhotoAsset(document.image),
  alt: document.alt,
  facet: facetOf(document),
  featured: document.destacada ?? false,
  ...(document.titulo != null && { title: document.titulo }),
  ...(document.tituloProvisorio != null && { provisionalTitle: document.tituloProvisorio }),
  ...(document.lugar != null && { place: document.lugar }),
  ...(document.anio != null && { year: document.anio }),
});

export const toPhotos = (documents: (SanityPhotoDocument | null)[] | null | undefined): Photo[] =>
  (documents ?? []).filter((document): document is SanityPhotoDocument => document !== null && hasImageAsset(document)).map(toPhoto);
