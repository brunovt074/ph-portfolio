export interface SanityBookingOfferDocument {
  titulo: string;
  slug: string;
  faceta?: string | null;
  descripcion?: string | null;
  precio?: number | null;
  duracionMinutos?: number | null;
  porcentajeSena?: number | null;
  orden?: number | null;
}
