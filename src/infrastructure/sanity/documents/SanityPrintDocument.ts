import type { SanityPhotoDocument } from './SanityPhotoDocument';

export interface SanityPrintDocument {
  id: string;
  edicion: number;
  disponibles?: number | null;
  activa?: boolean | null;
  tamanos?: { medida: string; precio: string }[] | null;
  foto: SanityPhotoDocument;
  serie: { numero: string; slug: string; titulo: string };
}
