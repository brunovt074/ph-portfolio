import type { Currency } from './Currency';
import type { PaymentKind } from './PaymentKind';
import type { PaymentStatus } from './PaymentStatus';

export interface Payment {
  id: string;
  bookingId: string;
  kind: PaymentKind;
  provider: string;
  checkoutId: string;
  checkoutUrl: string;
  externalPaymentId: string | null;
  status: PaymentStatus;
  amountCents: number;
  currency: Currency;
  raw: unknown;
  createdAt: Date;
  updatedAt: Date;
}
