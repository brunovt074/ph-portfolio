import type { Photo } from './Photo';
import type { RichTitle } from './RichTitle';

export interface ObraContent { opening: { photo: Photo; seriesNumber: string; seriesTitle: string; caption: RichTitle }; quote: string; seriesTitle: string; aboutTitle: RichTitle; exhibitionsTitle: string; printsTeaser: { title: RichTitle; lead: string; cta: string; photos: Photo[] }; seriesPrintsBand: { title: RichTitle; cta: string } }
