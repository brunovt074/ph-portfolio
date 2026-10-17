import type { SanityLocalized } from './SanityLocalized';

export interface SanityService {
  titulo: SanityLocalized<string>;
  descripcion?: SanityLocalized<string> | null;
  precio?: SanityLocalized<string> | null;
}
