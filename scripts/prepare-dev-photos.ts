import { existsSync, mkdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { MissingImageDimensionsError } from './MissingImageDimensionsError';

interface SeedPhoto {
  id: string;
  archivo: string;
}

interface Lqip {
  lqip: string;
  width: number;
  height: number;
}

interface Source {
  id: string;
  path: string;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(root, 'assets');
const outDir = join(assetsDir, 'fotos-dev');
const lqipPath = join(outDir, 'lqip.json');

const seed = JSON.parse(readFileSync(join(assetsDir, 'seed.json'), 'utf8')) as {
  fotos: SeedPhoto[];
  ajustes: { retrato: string };
};

const portraitId = 'retrato-lara';

const resolveSources = (): Source[] => [
  ...seed.fotos.map((photo): Source => ({ id: photo.id, path: join(assetsDir, photo.archivo) })),
  { id: portraitId, path: join(assetsDir, seed.ajustes.retrato) },
];

const isFresh = (source: string, target: string): boolean =>
  existsSync(target) && statSync(target).mtimeMs >= statSync(source).mtimeMs;

const readExistingLqip = (): Record<string, Lqip> =>
  existsSync(lqipPath) ? (JSON.parse(readFileSync(lqipPath, 'utf8')) as Record<string, Lqip>) : {};

const readDimensions = async (file: string): Promise<{ width: number; height: number }> => {
  const { width, height } = await sharp(file).metadata();
  if (!width || !height) {
    throw new MissingImageDimensionsError(file);
  }
  return { width, height };
};

const buildLqip = async (file: string): Promise<Lqip> => {
  const { width, height } = await readDimensions(file);
  const buffer = await sharp(file).resize(24).blur().webp({ quality: 40 }).toBuffer();
  return {
    lqip: `data:image/webp;base64,${buffer.toString('base64')}`,
    width,
    height,
  };
};

const processSource = async (source: Source): Promise<void> => {
  const target = join(outDir, `${source.id}.jpg`);
  await sharp(source.path).rotate().toColourspace('srgb').jpeg({ quality: 90, mozjpeg: true }).toFile(target);
};

const run = async (): Promise<void> => {
  mkdirSync(outDir, { recursive: true });
  const sources = resolveSources();
  const previous = readExistingLqip();
  const lqip: Record<string, Lqip> = {};
  for (const source of sources) {
    const target = join(outDir, `${source.id}.jpg`);
    if (!isFresh(source.path, target)) {
      await processSource(source);
      lqip[source.id] = await buildLqip(target);
    } else {
      lqip[source.id] = previous[source.id] ?? (await buildLqip(target));
    }
  }
  writeFileSync(lqipPath, JSON.stringify(lqip));
  console.log(`${sources.length} fotos`);
};

await run();
