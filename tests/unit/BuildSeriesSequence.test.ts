import { describe, expect, it } from 'vitest';
import { BuildSeriesSequence } from '@/application/BuildSeriesSequence';
import type { SeriesLayout } from '@/domain/SeriesLayout';
import type { SeriesPhoto } from '@/domain/SeriesPhoto';
import { aPhoto } from '../fixtures/aPhoto';

const seriesPhoto = (id: string, layout: SeriesLayout): SeriesPhoto => ({
  photo: aPhoto({ id, facet: 'obra' }),
  layout,
});

describe('BuildSeriesSequence', () => {
  it('groups the two consecutive pair photos of Geometrías into one screen at positions 4 and 5', () => {
    const photos = [
      seriesPhoto('au03', 'center'),
      seriesPhoto('au04', 'left'),
      seriesPhoto('au06', 'right'),
      seriesPhoto('au15', 'pair'),
      seriesPhoto('au19', 'pair'),
      seriesPhoto('au16', 'center'),
      seriesPhoto('au17', 'bleed'),
    ];

    const screens = new BuildSeriesSequence().execute(photos);

    expect(screens).toHaveLength(6);
    expect(screens[3]).toEqual({ kind: 'pair', items: [photos[3], photos[4]], positions: [4, 5] });
    expect(screens[4]).toEqual({ kind: 'single', item: photos[5], position: 6 });
    expect(screens[5]).toEqual({ kind: 'single', item: photos[6], position: 7 });
  });

  it('centers a pair photo that has no consecutive partner', () => {
    const photos = [seriesPhoto('au01', 'center'), seriesPhoto('au02', 'pair'), seriesPhoto('au05', 'right')];

    const screens = new BuildSeriesSequence().execute(photos);

    expect(screens[1]).toEqual({
      kind: 'single',
      item: { photo: photos[1]?.photo, layout: 'center' },
      position: 2,
    });
  });

  it('centers a trailing pair photo at the end of the series', () => {
    const photos = [seriesPhoto('au01', 'center'), seriesPhoto('au02', 'pair')];

    const screens = new BuildSeriesSequence().execute(photos);

    expect(screens).toHaveLength(2);
    expect(screens[1]).toMatchObject({ kind: 'single', position: 2, item: { layout: 'center' } });
  });

  it('pairs the first two of three consecutive pair photos and centers the third', () => {
    const photos = [seriesPhoto('au01', 'pair'), seriesPhoto('au02', 'pair'), seriesPhoto('au03', 'pair')];

    const screens = new BuildSeriesSequence().execute(photos);

    expect(screens.map((screen) => screen.kind)).toEqual(['pair', 'single']);
    expect(screens[1]).toMatchObject({ position: 3, item: { layout: 'center' } });
  });

  it('keeps one single screen per photo, in order, when the series has no pairs', () => {
    const photos = [seriesPhoto('au08', 'center'), seriesPhoto('au09', 'left'), seriesPhoto('au11', 'right'), seriesPhoto('au10', 'bleed')];

    const screens = new BuildSeriesSequence().execute(photos);

    expect(screens).toEqual(photos.map((item, index) => ({ kind: 'single', item, position: index + 1 })));
  });

  it('returns no screens for an empty series', () => {
    expect(new BuildSeriesSequence().execute([])).toEqual([]);
  });
});
