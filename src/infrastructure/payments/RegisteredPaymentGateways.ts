import type { PaymentGateway } from '@/domain/payment/PaymentGateway';
import type { PaymentGateways } from '@/domain/payment/PaymentGateways';

export class RegisteredPaymentGateways implements PaymentGateways {
  private readonly gateways = new Map<string, PaymentGateway>();

  constructor(readonly defaultProvider: string) {}

  register(gateway: PaymentGateway): void {
    this.gateways.set(gateway.provider, gateway);
  }

  find(provider: string): PaymentGateway | undefined {
    return this.gateways.get(provider);
  }
}
