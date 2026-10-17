import { createReadStream } from 'node:fs';
import { basename } from 'node:path';
import type { SanityClient } from '@sanity/client';
import type { ImageSource } from './imageSources';

const CONCURRENCY = 4;

export const uploadImages = async (client: SanityClient, sources: ImageSource[]): Promise<Map<string, string>> => {
  const assetIds = new Map<string, string>();
  const queue = sources.filter((source): source is ImageSource & { path: string } => source.path !== null);
  const worker = async () => {
    for (let source = queue.shift(); source; source = queue.shift()) {
      const asset = await client.assets.upload('image', createReadStream(source.path), { filename: basename(source.path) });
      assetIds.set(source.id, asset._id);
      console.log(`uploaded ${source.id} -> ${asset._id}`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return assetIds;
};
