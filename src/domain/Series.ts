import type { RichTitle } from './RichTitle';
import type { SeriesPhoto } from './SeriesPhoto';

export interface Series { number: string; slug: string; title: string; displayTitle: RichTitle; years: string; curatorialLine: string; curatorialText: string; photos: SeriesPhoto[] }
