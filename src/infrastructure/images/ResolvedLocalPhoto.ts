import type { ImageMetadata } from 'astro';

export interface ResolvedLocalPhoto {
  image: ImageMetadata;
  lqip?: string;
}
