import type { SanityBookingOfferDocument } from '@/infrastructure/sanity/documents/SanityBookingOfferDocument';

export const aSanityBookingOffer = (overrides: Partial<SanityBookingOfferDocument> = {}): SanityBookingOfferDocument => ({
  titulo: 'Maternidad',
  slug: 'maternidad',
  faceta: 'retratos',
  descripcion: 'La espera, en clave íntima y sin apuro.',
  precio: 95000,
  duracionMinutos: 90,
  porcentajeSena: 50,
  orden: 2,
  ...overrides,
});
