import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Clock } from '@/domain/Clock';
import type { Checkout } from '@/domain/payment/Checkout';
import type { CheckoutRequest } from '@/domain/payment/CheckoutRequest';
import type { GatewayPayment } from '@/domain/payment/GatewayPayment';
import type { IncomingNotification } from '@/domain/payment/IncomingNotification';
import type { ParsedNotification } from '@/domain/payment/ParsedNotification';
import type { PaymentGateway } from '@/domain/payment/PaymentGateway';
import { SystemClock } from '../../SystemClock';
import type { MercadoPagoApi } from './MercadoPagoApi';
import { mercadoPagoStatuses } from './mercadoPagoStatuses';

const STATEMENT_DESCRIPTOR = 'SARAH MOREAU';

export class MercadoPagoGateway implements PaymentGateway {
  readonly provider = 'mercadopago';

  constructor(
    private readonly api: MercadoPagoApi,
    private readonly webhookSecret: string,
    private readonly clock: Clock = new SystemClock(),
  ) {}

  async createCheckout(request: CheckoutRequest): Promise<Checkout> {
    const response = await this.api.createPreference({
      items: [
        {
          id: request.reference,
          title: request.title,
          quantity: 1,
          unit_price: request.amountCents / 100,
          currency_id: request.currency,
        },
      ],
      external_reference: request.reference,
      statement_descriptor: STATEMENT_DESCRIPTOR,
      payer: { name: request.payerName, email: request.payerEmail },
      back_urls: {
        success: `${request.returnUrl}?estado=aprobado`,
        pending: `${request.returnUrl}?estado=pendiente`,
        failure: `${request.returnUrl}?estado=error`,
      },
      notification_url: request.notificationUrl,
      ...(request.returnUrl.startsWith('https://') ? { auto_return: 'approved' } : {}),
      ...(request.expiresAt
        ? { expires: true, expiration_date_from: this.clock.now().toISOString(), expiration_date_to: request.expiresAt.toISOString() }
        : {}),
      ...(request.instantMethodsOnly ? { payment_methods: { excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }] } } : {}),
    });
    if (!response.id || !response.init_point) {
      throw new Error('Mercado Pago did not return the checkout');
    }
    return { checkoutId: response.id, checkoutUrl: response.init_point };
  }

  async fetchPayment(externalPaymentId: string): Promise<GatewayPayment> {
    if (!/^\d+$/.test(externalPaymentId)) {
      throw new Error('Invalid Mercado Pago payment id');
    }
    const response = await this.api.getPayment(externalPaymentId);
    return {
      externalPaymentId: String(response.id),
      reference: response.external_reference ?? '',
      status: mercadoPagoStatuses[response.status ?? ''] ?? 'pending',
      amountCents: Math.round((response.transaction_amount ?? 0) * 100),
      currency: response.currency_id ?? '',
      raw: response,
    };
  }

  parseNotification(notification: IncomingNotification): ParsedNotification {
    const body = (notification.body ?? {}) as { type?: unknown; data?: { id?: unknown } };
    const type = notification.query.type ?? notification.query.topic ?? body.type;
    const rawDataId = notification.query['data.id'] ?? body.data?.id;
    if (type !== 'payment' || rawDataId === undefined || rawDataId === null || rawDataId === '') {
      return { kind: 'ignored' };
    }
    const dataId = String(rawDataId);
    return this.hasValidSignature(notification, dataId) ? { kind: 'payment', externalPaymentId: dataId } : { kind: 'invalid' };
  }

  private hasValidSignature(notification: IncomingNotification, dataId: string): boolean {
    if (!this.webhookSecret) {
      return false;
    }
    const signature = notification.headers['x-signature'];
    const requestId = notification.headers['x-request-id'];
    if (!signature || !requestId) {
      return false;
    }
    const parts = Object.fromEntries(
      signature.split(',').map((part) => {
        const [key, ...value] = part.trim().split('=');
        return [key, value.join('=')];
      }),
    );
    const timestamp = parts.ts;
    const received = parts.v1;
    if (!timestamp || !received) {
      return false;
    }
    const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`;
    const expected = createHmac('sha256', this.webhookSecret).update(manifest).digest('hex');
    const receivedBuffer = Buffer.from(received);
    const expectedBuffer = Buffer.from(expected);
    return receivedBuffer.length === expectedBuffer.length && timingSafeEqual(receivedBuffer, expectedBuffer);
  }
}
