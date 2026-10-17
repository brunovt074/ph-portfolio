import type { BookingOffer } from '@/domain/booking/BookingOffer';

export const aBookingOffer = (overrides: Partial<BookingOffer> = {}): BookingOffer => ({
  slug: 'maternidad',
  title: 'Maternidad',
  description: 'La espera, en clave íntima y sin apuro.',
  facet: 'retratos',
  priceCents: 9_500_000,
  depositPercent: 50,
  durationMinutes: null,
  order: 1,
  translations: { es: true, en: false, pt: false },
  ...overrides,
});
