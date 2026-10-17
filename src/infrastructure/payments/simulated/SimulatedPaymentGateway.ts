import type { Checkout } from '@/domain/payment/Checkout';
import type { CheckoutRequest } from '@/domain/payment/CheckoutRequest';
import type { GatewayPayment } from '@/domain/payment/GatewayPayment';
import type { IncomingNotification } from '@/domain/payment/IncomingNotification';
import type { PaymentGateway } from '@/domain/payment/PaymentGateway';
import type { SimulatedCheckout } from './SimulatedCheckout';

export class SimulatedPaymentGateway implements PaymentGateway {
  readonly provider = 'simulado';
  private readonly checkouts = new Map<string, SimulatedCheckout>();
  private readonly payments = new Map<string, GatewayPayment>();

  constructor(private readonly siteUrl: string) {}

  async createCheckout(request: CheckoutRequest): Promise<Checkout> {
    const checkoutId = `sim_${this.checkouts.size + 1}`;
    this.checkouts.set(checkoutId, {
      checkoutId,
      reference: request.reference,
      amountCents: request.amountCents,
      currency: request.currency,
      returnUrl: request.returnUrl,
      title: request.title,
    });
    return { checkoutId, checkoutUrl: `${this.siteUrl}/reservas/simulador/${checkoutId}` };
  }

  findCheckout(checkoutId: string): SimulatedCheckout | undefined {
    return this.checkouts.get(checkoutId);
  }

  settle(checkoutId: string, status: 'approved' | 'rejected', amountCents?: number): string {
    const checkout = this.checkouts.get(checkoutId);
    if (!checkout) {
      throw new Error(`Unknown simulated checkout ${checkoutId}`);
    }
    const externalPaymentId = `simpay_${this.payments.size + 1}`;
    this.payments.set(externalPaymentId, {
      externalPaymentId,
      reference: checkout.reference,
      status,
      amountCents: amountCents ?? checkout.amountCents,
      currency: checkout.currency,
      raw: { simulated: true, checkoutId, status },
    });
    return externalPaymentId;
  }

  async fetchPayment(externalPaymentId: string): Promise<GatewayPayment> {
    const payment = this.payments.get(externalPaymentId);
    if (!payment) {
      throw new Error(`Unknown simulated payment ${externalPaymentId}`);
    }
    return payment;
  }

  parseNotification(notification: IncomingNotification): string | null {
    const body = notification.body as { paymentId?: unknown } | null;
    const paymentId = body?.paymentId;
    return typeof paymentId === 'string' && this.payments.has(paymentId) ? paymentId : null;
  }
}
