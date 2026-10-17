import type { SanityInfoItem } from './SanityInfoItem';
import type { SanityPhotoDocument } from './SanityPhotoDocument';

export interface SanitySettingsDocument {
  email: string;
  whatsapp: string;
  instagram: string[];
  frase: string;
  sobreMi: string;
  statement: string;
  retratoAlt: string;
  retrato: SanityPhotoDocument['image'];
  muestras?: { titulo: string; lugar: string; anio: string }[] | null;
  infoCopias?: SanityInfoItem[] | null;
}
