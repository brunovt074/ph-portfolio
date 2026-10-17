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
  kind: 'alta' | 'baja';
  crop: { left: number; top: number; width: number; height: number } | null;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(root, 'assets');
const outDir = join(assetsDir, 'fotos-dev');
const lqipPath = join(outDir, 'lqip.json');

const seed = JSON.parse(readFileSync(join(assetsDir, 'seed.json'), 'utf8')) as { fotos: SeedPhoto[] };

const portraitId = 'retrato-sarah';
const portraitHigh = join(assetsDir, 'fotos-alta', 'retrato-sarah-provisorio.png');
const portraitLow = join(assetsDir, 'fotos-baja', 'retrato-sarah-provisorio.jpg');

const resolveSources = (): Source[] => {
  const photos = seed.fotos.map((photo): Source => {
    const jpg = join(assetsDir, 'fotos-alta', `${photo.id}.jpg`);
    const png = join(assetsDir, 'fotos-alta', `${photo.id}.png`);
    const high = [jpg, png].find((candidate) => existsSync(candidate));
    return high
      ? { id: photo.id, path: high, kind: 'alta', crop: null }
      : { id: photo.id, path: join(assetsDir, photo.archivo), kind: 'baja', crop: null };
  });
  const portrait: Source = existsSync(portraitHigh)
    ? { id: portraitId, path: portraitHigh, kind: 'alta', crop: { left: 45, top: 40, width: 570, height: 760 } }
    : { id: portraitId, path: portraitLow, kind: 'baja', crop: null };
  return [...photos, portrait];
};

const bottomCropOverrides: Record<string, number> = { rt02: 0.14 };

const highCrop = (id: string, width: number, height: number) => {
  const left = Math.round(width * 0.04);
  const top = Math.round(height * 0.03);
  const right = Math.round(width * 0.06);
  const bottom = Math.round(height * (bottomCropOverrides[id] ?? 0.06));
  return { left, top, width: width - left - right, height: height - top - bottom };
};

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
  let pipeline = sharp(source.path).rotate();
  if (source.crop) {
    pipeline = pipeline.extract(source.crop);
  } else if (source.kind === 'alta') {
    const { width, height } = await readDimensions(source.path);
    pipeline = pipeline.extract(highCrop(source.id, width, height));
  }
  await pipeline.toColourspace('srgb').jpeg({ quality: 90, mozjpeg: true }).toFile(target);
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
  const high = sources.filter((source) => source.kind === 'alta').length;
  console.log(`${sources.length} fotos (${high} alta, ${sources.length - high} baja)`);
};

await run();
