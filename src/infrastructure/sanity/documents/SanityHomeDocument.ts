import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanityRichTitle } from './SanityRichTitle';
import type { SanityService } from './SanityService';

type PhotoList = (SanityPhotoDocument | null)[] | null;

export interface SanityHomeDocument {
  bajada: string;
  puertaEncargosFoto: SanityPhotoDocument;
  puertaEncargosEtiqueta: string;
  puertaEncargosTitulo: SanityRichTitle;
  puertaEncargosSubtitulo: string;
  puertaObraFoto: SanityPhotoDocument;
  puertaObraEtiqueta: string;
  puertaObraTitulo: SanityRichTitle;
  puertaObraSubtitulo: string;
  ticker: string[];
  sobreMiCta: string;
  encargosEyebrow: string;
  encargosTitulo: SanityRichTitle;
  miniaturasEditorial: PhotoList;
  miniaturasRetratos: PhotoList;
  miniaturasMarcas: PhotoList;
  miniaturasEventos: PhotoList;
  tiraEditorial: PhotoList;
  marcasEyebrow: string;
  marcasTitulo: SanityRichTitle;
  marcasServicios?: SanityService[] | null;
  marcasCta: string;
  marcasGrilla: PhotoList;
  obraTitulo: SanityRichTitle;
  obraBajada: string;
  obraFotos: PhotoList;
  obraCta: string;
  contactoTitulo: string;
  contactoBajada: string;
  tiposDeTrabajo: string[];
}
