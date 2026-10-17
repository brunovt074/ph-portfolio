import type { Booking } from '@/domain/booking/Booking';

export const checkoutTitle = (booking: Booking): string =>
  booking.paymentPlan === 'full' ? `Sesión completa — ${booking.offerTitle}` : `Seña — ${booking.offerTitle}`;
