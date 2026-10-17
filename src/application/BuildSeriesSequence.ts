import type { SeriesPhoto } from '@/domain/SeriesPhoto';
import type { SequenceScreen } from './SequenceScreen';

export class BuildSeriesSequence {
  execute(photos: SeriesPhoto[]): SequenceScreen[] {
    const screens: SequenceScreen[] = [];
    let nextUnconsumed = 0;
    photos.forEach((current, index) => {
      if (index < nextUnconsumed) {
        return;
      }
      const companion = photos[index + 1];
      if (current.layout === 'pair' && companion?.layout === 'pair') {
        screens.push({ kind: 'pair', items: [current, companion], positions: [index + 1, index + 2] });
        nextUnconsumed = index + 2;
        return;
      }
      const item: SeriesPhoto = current.layout === 'pair' ? { ...current, layout: 'center' } : current;
      screens.push({ kind: 'single', item, position: index + 1 });
      nextUnconsumed = index + 1;
    });
    return screens;
  }
}
