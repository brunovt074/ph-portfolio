import type { SanityLocalized } from './SanityLocalized';

export interface SanityPhotoDocument {
  id: string;
  alt: SanityLocalized<string>;
  titulo?: SanityLocalized<string> | null;
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
