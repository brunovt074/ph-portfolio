import type { Photo } from '@/domain/Photo';
import type { Print } from '@/domain/Print';
import type { SiteSettings } from '@/domain/SiteSettings';
import { resolveImageUrl } from '@/infrastructure/images/resolveImageUrl';
import { isPlaceholder } from './isPlaceholder';

const PERSON_NAME = 'Lara Vischi';
const JOB_TITLE = 'Fotógrafa y realizadora audiovisual';
const ARTWORK_IMAGE_WIDTH = 1200;

const instagramProfiles = (settings: SiteSettings): string[] =>
  settings.instagram.filter((account) => !isPlaceholder(account)).map((account) => `https://instagram.com/${account.replace(/^@/, '')}`);

const withoutEmpty = <T extends Record<string, unknown>>(entries: T): Partial<T> =>
  Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0))) as Partial<T>;

export const buildPersonSchema = (settings: SiteSettings, site: URL): Record<string, unknown> =>
  withoutEmpty({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PERSON_NAME,
    jobTitle: JOB_TITLE,
    url: site.href,
    sameAs: instagramProfiles(settings),
  });

export const buildProfessionalServiceSchema = async (settings: SiteSettings, site: URL, photo: Photo): Promise<Record<string, unknown>> =>
  withoutEmpty({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: PERSON_NAME,
    url: site.href,
    image: await resolveImageUrl(photo, site, ARTWORK_IMAGE_WIDTH),
    sameAs: instagramProfiles(settings),
    areaServed: 'AR',
  });

const buildArtwork = async (print: Print, site: URL): Promise<Record<string, unknown>> =>
  withoutEmpty({
    '@type': 'VisualArtwork',
    name: print.photo.title ?? 'Sin título',
    image: await resolveImageUrl(print.photo, site, ARTWORK_IMAGE_WIDTH),
    artform: 'Fotografía',
    artEdition: String(print.edition),
    creator: { '@type': 'Person', name: PERSON_NAME },
  });

export const buildPrintsSchema = async (prints: Print[], site: URL): Promise<Record<string, unknown>> => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: await Promise.all(
    prints.map(async (print, index) => ({ '@type': 'ListItem', position: index + 1, item: await buildArtwork(print, site) })),
  ),
});
