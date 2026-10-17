import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { SeedData } from '../../src/infrastructure/seed/data/SeedData';
import { PORTRAIT_ID } from './buildDocuments';

export interface ImageSource {
  id: string;
  path: string | null;
}

export const resolveImageSources = (seed: SeedData, assetsDir: string): ImageSource[] => {
  const candidates = [
    ...seed.fotos.map((photo) => ({ id: photo.id, fallback: join(assetsDir, photo.archivo) })),
    { id: PORTRAIT_ID, fallback: join(assetsDir, seed.ajustes.retrato) },
  ];
  return candidates.map(({ id, fallback }) => {
    const path = [join(assetsDir, 'fotos-dev', `${id}.jpg`), fallback].find((candidate) => existsSync(candidate));
    return { id, path: path ?? null };
  });
};
