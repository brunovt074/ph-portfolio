import type { FacetSlug } from '@/domain/FacetSlug';
import type { Photo } from '@/domain/Photo';
import type { SanityPhotoDocument } from '../documents/SanityPhotoDocument';
import { toPhotoAsset } from './toPhotoAsset';

export const toImagePhoto = (id: string, alt: string, facet: FacetSlug, image: SanityPhotoDocument['image']): Photo => ({
  id,
  asset: toPhotoAsset(image),
  alt,
  facet,
  featured: false,
});
