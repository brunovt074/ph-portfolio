export interface SanityPhotoDocument {
  id: string;
  alt: string;
  titulo?: string | null;
  tituloProvisorio?: boolean | null;
  lugar?: string | null;
  anio?: number | null;
  destacada?: boolean | null;
  facets?: string[] | null;
  image: {
    hotspot?: { x: number; y: number } | null;
    asset: { _id: string; lqip?: string | null; width?: number | null; height?: number | null };
  };
}
