import type { Series } from '@/domain/Series';
import type { SeriesPhoto } from '@/domain/SeriesPhoto';
import type { SanitySeriesDocument } from '../documents/SanitySeriesDocument';
import { seriesLayouts } from './seriesLayouts';
import { toPhoto } from './toPhoto';
import { toRichTitle } from './toRichTitle';

const toSeriesPhotos = (entries: NonNullable<SanitySeriesDocument['fotos']>): SeriesPhoto[] =>
  entries.flatMap((entry) => {
    const layout = seriesLayouts[entry.layout];
    return entry.foto === null || layout === undefined ? [] : [{ photo: toPhoto(entry.foto), layout }];
  });

export const toSeries = (document: SanitySeriesDocument): Series => ({
  number: document.numero,
  slug: document.slug,
  title: document.titulo,
  displayTitle: toRichTitle(document.tituloVisible),
  years: document.anios,
  curatorialLine: document.lineaCuratorial,
  curatorialText: document.textoCuratorial,
  photos: toSeriesPhotos(document.fotos ?? []),
});
