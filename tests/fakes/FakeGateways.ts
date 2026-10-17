import type { PaymentGateway } from '@/domain/payment/PaymentGateway';
import type { PaymentGateways } from '@/domain/payment/PaymentGateways';

export class FakeGateways implements PaymentGateways {
  constructor(
    private readonly registered: PaymentGateway[],
    readonly defaultProvider = registered[0]?.provider ?? 'none',
  ) {}

  find(provider: string): PaymentGateway | undefined {
    return this.registered.find((gateway) => gateway.provider === provider);
  }
}
