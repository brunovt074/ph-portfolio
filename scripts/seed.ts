import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';
import type { ContentData } from '../src/infrastructure/seed/data/ContentData';
import type { SeedData } from '../src/infrastructure/seed/data/SeedData';
import { buildDocuments } from './seed/buildDocuments';
import { resolveImageSources } from './seed/imageSources';
import { uploadImages } from './seed/uploadImages';

const API_VERSION = '2026-10-17';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(root, 'assets');

try {
  process.loadEnvFile(join(root, '.env'));
} catch {
  console.log('No .env file found, using the process environment.');
}

const readJson = <T>(name: string): T => JSON.parse(readFileSync(join(assetsDir, name), 'utf8')) as T;

const seed = readJson<SeedData>('seed.json');
const content = readJson<ContentData>('content.json');
const dryRun = process.argv.includes('--dry-run');
const sources = resolveImageSources(seed, assetsDir);

const printPlan = (documents: ReturnType<typeof buildDocuments>) => {
  const countByType = new Map<string, number>();
  documents.forEach((document) => countByType.set(document._type, (countByType.get(document._type) ?? 0) + 1));
  console.log('Seed plan (dry run, no network)');
  console.log(`Images to upload: ${sources.filter((source) => source.path !== null).length}`);
  sources
    .filter((source) => source.path === null)
    .forEach((source) => console.log(`  missing image file for ${source.id}`));
  console.log(`Documents to createOrReplace: ${documents.length}`);
  countByType.forEach((count, type) => console.log(`  ${type}: ${count}`));
  console.log('Singletons: ajustes, paginaInicio, paginaMarcas, paginaObra, paginaCopias');
  console.log(`Sample ids: ${documents.slice(0, 12).map((document) => document._id).join(', ')}`);
};

const run = async () => {
  if (dryRun) {
    printPlan(buildDocuments(seed, content, (imageId) => `pending-upload-${imageId}`));
    return;
  }
  const projectId = process.env.PUBLIC_SANITY_PROJECT_ID;
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!projectId || !token) {
    throw new Error('PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN are required. Use --dry-run to preview the plan.');
  }
  const client = createClient({
    projectId,
    dataset: process.env.PUBLIC_SANITY_DATASET || 'production',
    apiVersion: API_VERSION,
    token,
    useCdn: false,
  });
  const assetIds = await uploadImages(client, sources);
  const documents = buildDocuments(seed, content, (imageId) => {
    const assetId = assetIds.get(imageId);
    if (!assetId) {
      throw new Error(`No image file found for ${imageId}`);
    }
    return assetId;
  });
  const transaction = documents.reduce((pending, document) => pending.createOrReplace(document), client.transaction());
  await transaction.commit();
  console.log(`Seeded ${documents.length} documents.`);
};

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
