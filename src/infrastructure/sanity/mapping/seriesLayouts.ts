import type { SeriesLayout } from '@/domain/SeriesLayout';

export const seriesLayouts: Readonly<Record<string, SeriesLayout>> = {
  centro: 'center',
  izquierda: 'left',
  derecha: 'right',
  par: 'pair',
  sangre: 'bleed',
};
