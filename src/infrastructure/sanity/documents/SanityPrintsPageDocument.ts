import type { SanityInfoItem } from './SanityInfoItem';
import type { SanityLocalized } from './SanityLocalized';
import type { SanityRichTitle } from './SanityRichTitle';

export interface SanityPrintsPageDocument {
  titulo: SanityLocalized<SanityRichTitle>;
  bajada: SanityLocalized<string>;
  cta: SanityLocalized<string>;
  etiquetaEdicion: SanityLocalized<string>;
  info?: SanityInfoItem[] | null;
}
