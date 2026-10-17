import { locales, type Locale } from '@/domain/Locale';
import type { Series } from '@/domain/Series';
import type { SeriesPhoto } from '@/domain/SeriesPhoto';
import type { SanitySeriesDocument } from '../documents/SanitySeriesDocument';
import { hasImageAsset } from './hasImageAsset';
import { localizeText } from './localize';
import { seriesLayouts } from './seriesLayouts';
import { toPhoto } from './toPhoto';
import { toRichTitle } from './toRichTitle';
import { toSlug } from './toSlug';
import { translationsOf } from './translationsOf';

const toSeriesPhotos = (entries: NonNullable<SanitySeriesDocument['fotos']>, locale: Locale): SeriesPhoto[] =>
  entries.flatMap((entry) => {
    const layout = seriesLayouts[entry.layout];
    return entry.foto === null || !hasImageAsset(entry.foto) || layout === undefined ? [] : [{ photo: toPhoto(entry.foto, locale), layout }];
  });

const slugsOf = (document: SanitySeriesDocument): Record<Locale, string> =>
  Object.fromEntries(locales.map((locale) => [locale, toSlug(document.slug, locale)])) as Record<Locale, string>;

export const toSeries = (document: SanitySeriesDocument, locale: Locale): Series => ({
  number: document.numero,
  slug: toSlug(document.slug, locale),
  slugs: slugsOf(document),
  title: localizeText(document.titulo, locale),
  displayTitle: toRichTitle(document.tituloVisible, locale),
  years: document.anios,
  curatorialLine: localizeText(document.lineaCuratorial, locale),
  curatorialText: localizeText(document.textoCuratorial, locale),
  photos: toSeriesPhotos(document.fotos ?? [], locale),
  translations: translationsOf(document.titulo, document.textoCuratorial),
});
