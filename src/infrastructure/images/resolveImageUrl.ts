import { getImage } from 'astro:assets';
import type { Photo } from '@/domain/Photo';
import { sanityPhotoUrl } from '@/infrastructure/sanity/imageUrl';
import { resolveLocalPhoto } from './localPhotos';

export const resolveImageUrl = async (photo: Photo, site: URL, width: number, height?: number): Promise<string> => {
  if (photo.asset.provider === 'sanity') {
    return sanityPhotoUrl(photo, width, height ? width / height : undefined);
  }
  const { image } = resolveLocalPhoto(photo.asset.ref);
  const optimized = await getImage({ src: image, width, ...(height ? { height, fit: 'cover' as const } : {}), format: 'jpeg' });
  return new URL(optimized.src, site).href;
};
