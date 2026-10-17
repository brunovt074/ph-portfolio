import type { SanityLocalized } from './SanityLocalized';
import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';
import type { SanitySlug } from './SanitySlug';

export interface SanitySeriesDocument {
  numero: string;
  slug?: SanityLocalized<SanitySlug> | null;
  titulo: SanityLocalized<string>;
  tituloVisible: SanityLocalized<SanityRichTitle>;
  anios: string;
  lineaCuratorial: SanityLocalized<string>;
  textoCuratorial: SanityLocalized<string>;
  fotos?: { layout: string; foto: SanityPhotoDocument | null }[] | null;
}
