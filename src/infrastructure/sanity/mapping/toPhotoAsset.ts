import type { PhotoAsset } from '@/domain/PhotoAsset';
import type { SanityPhotoDocument } from '../documents/SanityPhotoDocument';

export const toPhotoAsset = (image: SanityPhotoDocument['image']): PhotoAsset => ({
  provider: 'sanity',
  ref: image.asset._id,
  ...(image.hotspot != null && { hotspot: { x: image.hotspot.x, y: image.hotspot.y } }),
  ...(image.asset.lqip != null && { lqip: image.asset.lqip }),
  ...(image.asset.width != null && { width: image.asset.width }),
  ...(image.asset.height != null && { height: image.asset.height }),
});
