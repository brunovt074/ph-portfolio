import type { SanityLocalized } from './SanityLocalized';

export interface SanityBookingOfferDocument {
  titulo: SanityLocalized<string>;
  slug: string;
  faceta?: string | null;
  descripcion?: SanityLocalized<string> | null;
  precio?: number | null;
  duracionMinutos?: number | null;
  porcentajeSena?: number | null;
  orden?: number | null;
}
