import { createImageUrlBuilder } from '@sanity/image-url';
import type { Photo } from '@/domain/Photo';

type UrlBuilder = ReturnType<typeof createImageUrlBuilder>;

export const SANITY_WIDTHS = [320, 480, 640, 800, 1080, 1440, 1920, 2400];
const QUALITY = 78;

let cachedBuilder: UrlBuilder | undefined;

const builder = (): UrlBuilder => {
  cachedBuilder ??= createImageUrlBuilder({
    projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID ?? '',
    dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  });
  return cachedBuilder;
};

export const parseRatio = (ratio: string): number => {
  const [numerator = 1, denominator = 1] = ratio.split('/').map(Number);
  return numerator / denominator;
};

export const sanityPhotoUrl = (photo: Photo, width: number, ratio?: number): string => {
  const { hotspot } = photo.asset;
  let image = builder().image(photo.asset.ref).width(width).auto('format').quality(QUALITY);
  if (ratio) {
    image = image.height(Math.round(width / ratio)).fit('crop');
    if (hotspot) {
      image = image.crop('focalpoint').focalPoint(hotspot.x, hotspot.y);
    }
  }
  return image.url();
};

export const sanityWidths = (photo: Photo): number[] => {
  const original = photo.asset.width;
  if (!original) {
    return SANITY_WIDTHS;
  }
  return [...SANITY_WIDTHS.filter((width) => width < original), original];
};

export const sanitySrcset = (photo: Photo, ratio?: number): string =>
  sanityWidths(photo)
    .map((width) => `${sanityPhotoUrl(photo, width, ratio)} ${width}w`)
    .join(', ');

export const sanityAspect = (photo: Photo): number | undefined => {
  const { width, height } = photo.asset;
  return width && height ? width / height : undefined;
};
