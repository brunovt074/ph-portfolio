import type { Photo } from '@/domain/Photo';
import { resolveLocalPhoto } from '@/infrastructure/images/localPhotos';

const FALLBACK_ASPECT = 4 / 5;

export const photoAspect = (photo: Photo): number => {
  if (photo.asset.provider !== 'local') {
    return FALLBACK_ASPECT;
  }
  const { width, height } = resolveLocalPhoto(photo.asset.ref).image;
  return width / height;
};
