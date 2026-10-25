import type { GatewayPayment } from '@/domain/payment/GatewayPayment';

export const aGatewayPayment = (overrides: Partial<GatewayPayment> = {}): GatewayPayment => ({
  externalPaymentId: 'ext-1',
  reference: 'payment-1',
  status: 'approved',
  amountCents: 4_750_000,
  currency: 'USD',
  raw: { id: 'ext-1' },
  ...overrides,
});
