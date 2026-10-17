import type { SanityPhotoDocument } from '../documents/SanityPhotoDocument';

export const hasImageAsset = (document: SanityPhotoDocument): boolean => document.image?.asset != null;
