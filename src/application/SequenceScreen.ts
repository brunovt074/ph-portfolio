import type { SeriesPhoto } from '@/domain/SeriesPhoto';

export type SequenceScreen =
  | { kind: 'single'; item: SeriesPhoto; position: number }
  | { kind: 'pair'; items: [SeriesPhoto, SeriesPhoto]; positions: [number, number] };
