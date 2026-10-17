import type { SanityInfoItem } from './SanityInfoItem';
import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';

export interface SanityBrandsDocument {
  ctaCabecera: string;
  rubrosTitulo: string;
  rubros: { titulo: string; descripcion: string; foto: SanityPhotoDocument }[];
  masTrabajosTitulo: string;
  antesDespuesTitulo: SanityRichTitle;
  antesDespuesBajada: string;
  procesoTitulo: SanityRichTitle;
  pasos: SanityInfoItem[];
  paquetesTitulo: string;
  paquetesCta: string;
}
