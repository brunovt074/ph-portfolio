export interface SanityBrandPackageDocument {
  nombre: string;
  precio: string;
  items: string[];
  destacado?: boolean | null;
  orden?: number | null;
}
