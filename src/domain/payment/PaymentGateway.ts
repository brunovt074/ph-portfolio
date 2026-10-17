import type { Checkout } from './Checkout';
import type { CheckoutRequest } from './CheckoutRequest';
import type { GatewayPayment } from './GatewayPayment';
import type { IncomingNotification } from './IncomingNotification';

export interface PaymentGateway {
  readonly provider: string;
  createCheckout(request: CheckoutRequest): Promise<Checkout>;
  fetchPayment(externalPaymentId: string): Promise<GatewayPayment>;
  parseNotification(notification: IncomingNotification): string | null;
}
