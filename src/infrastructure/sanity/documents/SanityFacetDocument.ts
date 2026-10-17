import type { SanityLocalized } from './SanityLocalized';
import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';
import type { SanityService } from './SanityService';

export interface SanityFacetDocument {
  slug: string;
  numero: number;
  nombre: SanityLocalized<string>;
  titulo: SanityLocalized<SanityRichTitle>;
  lead: SanityLocalized<string>;
  indexDescription: SanityLocalized<string>;
  quote?: SanityLocalized<SanityRichTitle> | null;
  ctaTexto: SanityLocalized<string>;
  ctaButton: SanityLocalized<string>;
  portada?: (SanityPhotoDocument | null)[] | null;
  galeria?: (SanityPhotoDocument | null)[] | null;
  servicios?: SanityService[] | null;
}
