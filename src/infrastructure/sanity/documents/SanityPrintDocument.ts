import type { SanityLocalized } from './SanityLocalized';
import type { SanityPhotoDocument } from './SanityPhotoDocument';
import type { SanitySlug } from './SanitySlug';

export interface SanityPrintDocument {
  id: string;
  edicion: number;
  disponibles?: number | null;
  activa?: boolean | null;
  tamanos?: { medida: string; precio: string }[] | null;
  foto: SanityPhotoDocument;
  serie: { numero: string; slug?: SanityLocalized<SanitySlug> | null; titulo: SanityLocalized<string> };
}
