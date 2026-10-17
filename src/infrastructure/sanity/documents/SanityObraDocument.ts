import type { SanityLocalized } from './SanityLocalized';
import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';

export interface SanityObraDocument {
  aperturaFoto: SanityPhotoDocument;
  aperturaSerieNumero: SanityLocalized<string>;
  aperturaSerieTitulo: SanityLocalized<string>;
  aperturaLeyenda: SanityLocalized<SanityRichTitle>;
  frase: SanityLocalized<string>;
  seriesTitulo: SanityLocalized<string>;
  sobreTitulo: SanityLocalized<SanityRichTitle>;
  muestrasTitulo: SanityLocalized<string>;
  copiasTitulo: SanityLocalized<SanityRichTitle>;
  copiasBajada: SanityLocalized<string>;
  copiasCta: SanityLocalized<string>;
  bandaTitulo: SanityLocalized<SanityRichTitle>;
  bandaCta: SanityLocalized<string>;
}
