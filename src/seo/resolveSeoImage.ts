import type { Photo } from '@/domain/Photo';
import { resolveImageUrl } from '@/infrastructure/images/resolveImageUrl';
import type { SeoImage } from './SeoImage';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export const resolveSeoImage = async (photo: Photo, site: URL): Promise<SeoImage> => ({
  url: await resolveImageUrl(photo, site, OG_IMAGE_WIDTH, OG_IMAGE_HEIGHT),
  alt: photo.alt,
});
