import type { Photo } from './Photo';
import type { SeriesSummary } from './SeriesSummary';
import type { PrintSize } from './PrintSize';

export interface Print { id: string; photo: Photo; series: SeriesSummary; edition: number; available: number | null; sizes: PrintSize[]; active: boolean }
