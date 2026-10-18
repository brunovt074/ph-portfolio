import type { Payment } from '@/domain/payment/Payment';
import type { PaymentRow } from '../PaymentRow';

export const toPaymentRow = (payment: Payment): PaymentRow => ({
  id: payment.id,
  bookingId: payment.bookingId,
  kind: payment.kind,
  provider: payment.provider,
  checkoutId: payment.checkoutId,
  checkoutUrl: payment.checkoutUrl,
  externalPaymentId: payment.externalPaymentId,
  status: payment.status,
  amountCents: payment.amountCents,
  currency: payment.currency,
  raw: payment.raw ?? {},
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});
