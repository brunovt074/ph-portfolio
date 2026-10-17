import type { ImageMetadata } from 'astro';

interface LqipEntry {
  lqip: string;
  width: number;
  height: number;
}

const imageModules = import.meta.glob<ImageMetadata>('/assets/fotos-dev/*.jpg', { eager: true, import: 'default' });
const lqipModules = import.meta.glob<Record<string, LqipEntry>>('/assets/fotos-dev/lqip.json', {
  eager: true,
  import: 'default',
});

const imagesById = new Map<string, ImageMetadata>(
  Object.entries(imageModules).map(([path, image]) => [path.slice(path.lastIndexOf('/') + 1, -'.jpg'.length), image]),
);

const lqipById: Record<string, LqipEntry> = Object.values(lqipModules)[0] ?? {};

export interface ResolvedLocalPhoto {
  image: ImageMetadata;
  lqip?: string;
}

export const resolveLocalPhoto = (id: string): ResolvedLocalPhoto => {
  const image = imagesById.get(id);
  if (!image) {
    throw new Error(`Local photo not found: ${id}. Run "npm run photos".`);
  }
  const lqip = lqipById[id]?.lqip;
  return lqip ? { image, lqip } : { image };
};
