import type { Payment } from '@/domain/payment/Payment';

export const aPayment = (overrides: Partial<Payment> = {}): Payment => ({
  id: 'payment-1',
  bookingId: 'booking-1',
  kind: 'deposit',
  provider: 'fake',
  checkoutId: 'checkout-1',
  checkoutUrl: 'https://pay.example/checkout-1',
  externalPaymentId: null,
  status: 'pending',
  amountCents: 4_750_000,
  currency: 'ARS',
  raw: {},
  createdAt: new Date('2026-10-17T15:00:00Z'),
  updatedAt: new Date('2026-10-17T15:00:00Z'),
  ...overrides,
});
