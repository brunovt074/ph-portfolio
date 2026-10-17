import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';
import type { SanityService } from './SanityService';

export interface SanityFacetDocument {
  slug: string;
  numero: number;
  nombre: string;
  titulo: SanityRichTitle;
  lead: string;
  indexDescription: string;
  quote?: SanityRichTitle | null;
  ctaTexto: string;
  ctaButton: string;
  portada?: (SanityPhotoDocument | null)[] | null;
  galeria?: (SanityPhotoDocument | null)[] | null;
  servicios?: SanityService[] | null;
}
