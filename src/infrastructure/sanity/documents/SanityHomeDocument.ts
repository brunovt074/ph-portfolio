import type { SanityLocalized } from './SanityLocalized';
import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';
import type { SanityService } from './SanityService';

type PhotoList = (SanityPhotoDocument | null)[] | null;
type Text = SanityLocalized<string>;
type Title = SanityLocalized<SanityRichTitle>;
type List = SanityLocalized<string[]> | null;

export interface SanityHomeDocument {
  bajada: Text;
  puertaEncargosFoto: SanityPhotoDocument;
  puertaEncargosEtiqueta: Text;
  puertaEncargosTitulo: Title;
  puertaEncargosSubtitulo: Text;
  puertaObraFoto: SanityPhotoDocument;
  puertaObraEtiqueta: Text;
  puertaObraTitulo: Title;
  puertaObraSubtitulo: Text;
  ticker: List;
  sobreMiCta: Text;
  encargosEyebrow: Text;
  encargosTitulo: Title;
  miniaturasEditorial: PhotoList;
  miniaturasRetratos: PhotoList;
  miniaturasMarcas: PhotoList;
  miniaturasEventos: PhotoList;
  tiraEditorial: PhotoList;
  marcasEyebrow: Text;
  marcasTitulo: Title;
  marcasServicios?: SanityService[] | null;
  marcasCta: Text;
  marcasGrilla: PhotoList;
  obraTitulo: Title;
  obraBajada: Text;
  obraFotos: PhotoList;
  obraCta: Text;
  contactoTitulo: Text;
  contactoBajada: Text;
  tiposDeTrabajo: List;
}
