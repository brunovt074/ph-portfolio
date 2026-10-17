import type { SanityInfoItem } from './SanityInfoItem';
import type { SanityLocalized } from './SanityLocalized';
import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';

export interface SanityBrandsDocument {
  ctaCabecera: SanityLocalized<string>;
  rubrosTitulo: SanityLocalized<string>;
  rubros: { titulo: SanityLocalized<string>; descripcion: SanityLocalized<string>; foto: SanityPhotoDocument }[];
  masTrabajosTitulo: SanityLocalized<string>;
  antesDespuesTitulo: SanityLocalized<SanityRichTitle>;
  antesDespuesBajada: SanityLocalized<string>;
  procesoTitulo: SanityLocalized<SanityRichTitle>;
  pasos: SanityInfoItem[];
  paquetesTitulo: SanityLocalized<string>;
  paquetesCta: SanityLocalized<string>;
}
