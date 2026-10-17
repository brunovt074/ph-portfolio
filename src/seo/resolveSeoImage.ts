import type { Photo } from '@/domain/Photo';
import { resolveImageUrl } from '@/infrastructure/images/resolveImageUrl';
import { resolveLocalPhoto } from '@/infrastructure/images/localPhotos';
import type { SeoImage } from './SeoImage';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

const sourceDimensions = (photo: Photo): { width: number; height: number } | undefined => {
  if (photo.asset.provider === 'local') {
    const { image } = resolveLocalPhoto(photo.asset.ref);
    return { width: image.width, height: image.height };
  }
  const { width, height } = photo.asset;
  return width && height ? { width, height } : undefined;
};

export const resolveSeoImage = async (photo: Photo, site: URL): Promise<SeoImage> => {
  const source = sourceDimensions(photo);
  return {
    url: await resolveImageUrl(photo, site, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT),
    alt: photo.alt,
    width: Math.min(OG_IMAGE_WIDTH, source?.width ?? OG_IMAGE_WIDTH),
    height: Math.min(OG_IMAGE_HEIGHT, source?.height ?? OG_IMAGE_HEIGHT),
  };
};
