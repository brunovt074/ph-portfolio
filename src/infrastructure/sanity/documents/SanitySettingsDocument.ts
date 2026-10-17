import type { SanityInfoItem } from './SanityInfoItem';
import type { SanityLocalized } from './SanityLocalized';
import type { SanityPhotoDocument } from './SanityPhotoDocument';

export interface SanitySettingsDocument {
  email: string;
  whatsapp: string;
  instagram: string[];
  frase: SanityLocalized<string>;
  sobreMi: SanityLocalized<string>;
  statement: SanityLocalized<string>;
  retratoAlt: SanityLocalized<string>;
  retrato: SanityPhotoDocument['image'];
  muestras?: { titulo: SanityLocalized<string>; lugar: string; anio: string }[] | null;
  infoCopias?: SanityInfoItem[] | null;
}
