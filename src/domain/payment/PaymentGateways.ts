import type { PaymentGateway } from './PaymentGateway';

export interface PaymentGateways {
  readonly defaultProvider: string;
  find(provider: string): PaymentGateway | undefined;
}
