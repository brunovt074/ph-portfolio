import type { FacetSlug } from '@/domain/FacetSlug';
import type { Photo } from '@/domain/Photo';
import type { SanityPhotoDocument } from '../documents/SanityPhotoDocument';
import { toPhotoAsset } from './toPhotoAsset';

const facetSlugs: ReadonlySet<string> = new Set<FacetSlug>(['editorial', 'retratos', 'marcas', 'eventos']);

const facetOf = (document: SanityPhotoDocument): FacetSlug | 'obra' => {
  const slug = (document.facets ?? []).find((candidate) => facetSlugs.has(candidate));
  return slug === undefined ? 'obra' : (slug as FacetSlug);
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
  (documents ?? []).filter((document): document is SanityPhotoDocument => document !== null).map(toPhoto);
