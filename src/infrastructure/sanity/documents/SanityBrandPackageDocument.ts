import type { SanityLocalized } from './SanityLocalized';

export interface SanityBrandPackageDocument {
  nombre: SanityLocalized<string>;
  precio: SanityLocalized<string>;
  items: SanityLocalized<string[]>;
  destacado?: boolean | null;
  orden?: number | null;
}
