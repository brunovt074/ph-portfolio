import type { PaymentStatus } from './PaymentStatus';

export interface GatewayPayment {
  externalPaymentId: string;
  reference: string;
  status: PaymentStatus;
  amountCents: number;
  currency: string;
  raw: unknown;
}
