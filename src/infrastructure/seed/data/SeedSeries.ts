import type { SeedSeriesPhoto } from './SeedSeriesPhoto';

export interface SeedSeries {
  numero: string;
  titulo: string;
  lineaCuratorial: string;
  anios: string;
  fotos: SeedSeriesPhoto[];
}
