import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';

export interface SanitySeriesDocument {
  numero: string;
  slug: string;
  titulo: string;
  tituloVisible: SanityRichTitle;
  anios: string;
  lineaCuratorial: string;
  textoCuratorial: string;
  fotos?: { layout: string; foto: SanityPhotoDocument | null }[] | null;
}
