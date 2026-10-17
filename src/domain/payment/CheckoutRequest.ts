import type { Currency } from './Currency';

export interface CheckoutRequest {
  reference: string;
  title: string;
  amountCents: number;
  currency: Currency;
  payerName: string;
  payerEmail: string;
  returnUrl: string;
  notificationUrl: string;
  expiresAt?: Date;
  instantMethodsOnly?: boolean;
}
