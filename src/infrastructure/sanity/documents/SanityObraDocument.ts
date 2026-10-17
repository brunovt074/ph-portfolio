import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';

export interface SanityObraDocument {
  aperturaFoto: SanityPhotoDocument;
  aperturaSerieNumero: string;
  aperturaSerieTitulo: string;
  aperturaLeyenda: SanityRichTitle;
  frase: string;
  seriesTitulo: string;
  sobreTitulo: SanityRichTitle;
  muestrasTitulo: string;
  copiasTitulo: SanityRichTitle;
  copiasBajada: string;
  copiasCta: string;
  bandaTitulo: SanityRichTitle;
  bandaCta: string;
}
