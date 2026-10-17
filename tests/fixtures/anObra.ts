import type { ObraContent } from '@/domain/ObraContent';
import { aPhoto } from './aPhoto';

export const anObra = (): ObraContent => ({
  opening: { photo: aPhoto(), seriesNumber: 'I', seriesTitle: 'Oficios', caption: [] },
  quote: 'Una bitácora de mi trabajo.',
  seriesTitle: 'Series',
  aboutTitle: [],
  exhibitionsTitle: 'Muestras y publicaciones',
  printsTeaser: { title: [], lead: '', cta: '', photos: [] },
  seriesPrintsBand: { title: [], cta: '' },
});
