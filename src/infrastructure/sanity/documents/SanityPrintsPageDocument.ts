import type { SanityInfoItem } from './SanityInfoItem';
import type { SanityRichTitle } from './SanityRichTitle';

export interface SanityPrintsPageDocument {
  titulo: SanityRichTitle;
  bajada: string;
  cta: string;
  etiquetaEdicion: string;
  info?: SanityInfoItem[] | null;
}
