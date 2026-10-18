import type { Checkout } from '@/domain/payment/Checkout';
import type { CheckoutRequest } from '@/domain/payment/CheckoutRequest';
import type { GatewayPayment } from '@/domain/payment/GatewayPayment';
import type { IncomingNotification } from '@/domain/payment/IncomingNotification';
import type { ParsedNotification } from '@/domain/payment/ParsedNotification';
import type { PaymentGateway } from '@/domain/payment/PaymentGateway';

export class FakePaymentGateway implements PaymentGateway {
  readonly requests: CheckoutRequest[] = [];
  private readonly remotePayments = new Map<string, GatewayPayment>();
  private failure: unknown = null;
  private gate: Promise<void> | null = null;
  private checkoutGate: Promise<void> | null = null;

  constructor(readonly provider = 'fake') {}

  failCheckoutsWith(failure: unknown): void {
    this.failure = failure;
  }

  holdsFetchesUntilReleased(): () => void {
    let release = () => {};
    this.gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    return release;
  }

  holdsCheckoutsUntilReleased(): () => void {
    let release = () => {};
    this.checkoutGate = new Promise<void>((resolve) => {
      release = resolve;
    });
    return release;
  }

  hasRemotePayment(payment: GatewayPayment): void {
    this.remotePayments.set(payment.externalPaymentId, payment);
  }

  async createCheckout(request: CheckoutRequest): Promise<Checkout> {
    if (this.failure !== null) {
      throw this.failure;
    }
    await this.checkoutGate;
    this.requests.push(request);
    const checkoutId = `checkout-${this.requests.length}`;
    return { checkoutId, checkoutUrl: `https://pay.example/${checkoutId}` };
  }

  async fetchPayment(externalPaymentId: string): Promise<GatewayPayment> {
    await this.gate;
    const payment = this.remotePayments.get(externalPaymentId);
    if (!payment) {
      throw new Error(`unknown payment ${externalPaymentId}`);
    }
    return payment;
  }

  parseNotification(notification: IncomingNotification): ParsedNotification {
    const body = notification.body as { paymentId?: string; ignore?: boolean } | null;
    if (body?.ignore) {
      return { kind: 'ignored' };
    }
    return body?.paymentId ? { kind: 'payment', externalPaymentId: body.paymentId } : { kind: 'invalid' };
  }
}
