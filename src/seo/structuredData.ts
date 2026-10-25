import type { Photo } from '@/domain/Photo';
import { BRAND } from '@/config/brand';
import type { Locale } from '@/domain/Locale';
import type { Print } from '@/domain/Print';
import type { SiteSettings } from '@/domain/SiteSettings';
import type { SiteTexts } from '@/domain/SiteTexts';
import { pathTo } from '@/domain/routing/pathTo';
import { resolveImageUrl } from '@/infrastructure/images/resolveImageUrl';
import { htmlLanguages as languageTags } from './htmlLanguages';
import { isPlaceholder } from './isPlaceholder';

const PERSON_NAME = BRAND.fullName;
const ARTWORK_IMAGE_WIDTH = 1200;

const instagramProfiles = (settings: SiteSettings): string[] =>
  settings.instagram.filter((account) => !isPlaceholder(account)).map((account) => `https://instagram.com/${account.replace(/^@/, '')}`);

const withoutEmpty = <T extends Record<string, unknown>>(entries: T): Partial<T> =>
  Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== undefined && !(Array.isArray(value) && value.length === 0))) as Partial<T>;

const homeUrl = (site: URL, locale: Locale): string => new URL(pathTo(locale, { route: 'home' }), site).href;

export const buildPersonSchema = (settings: SiteSettings, site: URL, texts: SiteTexts, locale: Locale): Record<string, unknown> =>
  withoutEmpty({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: PERSON_NAME,
    jobTitle: texts.seo.jobTitle,
    url: homeUrl(site, locale),
    inLanguage: languageTags[locale],
    sameAs: instagramProfiles(settings),
  });

export const buildProfessionalServiceSchema = async (
  settings: SiteSettings,
  site: URL,
  locale: Locale,
  photo: Photo,
): Promise<Record<string, unknown>> =>
  withoutEmpty({
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: PERSON_NAME,
    url: homeUrl(site, locale),
    inLanguage: languageTags[locale],
    image: await resolveImageUrl(photo, site, ARTWORK_IMAGE_WIDTH),
    sameAs: instagramProfiles(settings),
    areaServed: 'AR',
  });

const buildArtwork = async (print: Print, site: URL, texts: SiteTexts): Promise<Record<string, unknown>> =>
  withoutEmpty({
    '@type': 'VisualArtwork',
    name: print.photo.title ?? texts.pages.untitled,
    image: await resolveImageUrl(print.photo, site, ARTWORK_IMAGE_WIDTH),
    artform: texts.seo.artworkGenre,
    artEdition: String(print.edition),
    creator: { '@type': 'Person', name: PERSON_NAME },
  });

export const buildPrintsSchema = async (prints: Print[], site: URL, texts: SiteTexts, locale: Locale): Promise<Record<string, unknown>> => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  inLanguage: languageTags[locale],
  itemListElement: await Promise.all(
    prints.map(async (print, index) => ({ '@type': 'ListItem', position: index + 1, item: await buildArtwork(print, site, texts) })),
  ),
});
