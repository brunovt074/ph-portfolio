import type { Currency } from '@/domain/payment/Currency';

export interface SimulatedCheckout {
  checkoutId: string;
  reference: string;
  amountCents: number;
  currency: Currency;
  returnUrl: string;
  title: string;
}
