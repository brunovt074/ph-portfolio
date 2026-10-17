import type { Payment } from '@/domain/payment/Payment';
import type { PaymentRow } from '../schema';

export const toPayment = (row: PaymentRow): Payment => ({
  id: row.id,
  bookingId: row.bookingId,
  kind: row.kind,
  provider: row.provider,
  checkoutId: row.checkoutId,
  checkoutUrl: row.checkoutUrl,
  externalPaymentId: row.externalPaymentId,
  status: row.status,
  amountCents: row.amountCents,
  currency: row.currency as Payment['currency'],
  raw: row.raw,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
