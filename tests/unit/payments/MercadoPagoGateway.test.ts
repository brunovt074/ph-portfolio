import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { CheckoutRequest } from '@/domain/payment/CheckoutRequest';
import type { MercadoPagoApi } from '@/infrastructure/payments/mercadopago/MercadoPagoApi';
import { MercadoPagoGateway } from '@/infrastructure/payments/mercadopago/MercadoPagoGateway';

type PreferenceResult = Awaited<ReturnType<MercadoPagoApi['createPreference']>>;
type PaymentResult = Awaited<ReturnType<MercadoPagoApi['getPayment']>>;

class FakeMercadoPagoApi implements MercadoPagoApi {
  sentBodies: Record<string, unknown>[] = [];
  requestedPaymentIds: string[] = [];

  constructor(
    private readonly preference: PreferenceResult = { id: 'pref-1', init_point: 'https://mp.test/pay/pref-1' },
    private readonly payment: PaymentResult = {},
  ) {}

  async createPreference(body: Record<string, unknown>) {
    this.sentBodies.push(body);
    return this.preference;
  }

  async getPayment(id: string) {
    this.requestedPaymentIds.push(id);
    return this.payment;
  }
}

const secret = 'webhook-secret';

const request = (overrides: Partial<CheckoutRequest> = {}): CheckoutRequest => ({
  reference: 'pay-1',
  title: 'Seña — Maternidad',
  amountCents: 4_750_000,
  currency: 'ARS',
  payerName: 'Camila Ríos',
  payerEmail: 'camila@example.com',
  returnUrl: 'https://sarahmoreau.example/reservas/booking-1',
  notificationUrl: 'https://sarahmoreau.example/api/payments/webhook/mercadopago',
  ...overrides,
});

const sign = (dataId: string, requestId: string, timestamp: string, key = secret) =>
  createHmac('sha256', key).update(`id:${dataId.toLowerCase()};request-id:${requestId};ts:${timestamp};`).digest('hex');

const signedNotification = (dataId = '123456', requestId = 'req-1', timestamp = '1700000000') => ({
  headers: { 'x-signature': `ts=${timestamp}, v1=${sign(dataId, requestId, timestamp)}`, 'x-request-id': requestId } as Record<string, string>,
  query: { type: 'payment', 'data.id': dataId } as Record<string, string>,
  body: {} as unknown,
});

describe('MercadoPagoGateway', () => {
  describe('createCheckout', () => {
    it('sends the deposit in pesos with payer email, descriptor and return urls', async () => {
      const api = new FakeMercadoPagoApi();

      const checkout = await new MercadoPagoGateway(api, secret).createCheckout(request());

      expect(checkout).toEqual({ checkoutId: 'pref-1', checkoutUrl: 'https://mp.test/pay/pref-1' });
      expect(api.sentBodies[0]).toEqual({
        items: [{ id: 'pay-1', title: 'Seña — Maternidad', quantity: 1, unit_price: 47_500, currency_id: 'ARS' }],
        external_reference: 'pay-1',
        statement_descriptor: 'SARAH MOREAU',
        payer: { name: 'Camila Ríos', email: 'camila@example.com' },
        back_urls: {
          success: 'https://sarahmoreau.example/reservas/booking-1?estado=aprobado',
          pending: 'https://sarahmoreau.example/reservas/booking-1?estado=pendiente',
          failure: 'https://sarahmoreau.example/reservas/booking-1?estado=error',
        },
        notification_url: 'https://sarahmoreau.example/api/payments/webhook/mercadopago',
        auto_return: 'approved',
      });
    });

    it('omits auto return when the return url is not https', async () => {
      const api = new FakeMercadoPagoApi();

      await new MercadoPagoGateway(api, secret).createCheckout(request({ returnUrl: 'http://localhost:4321/reservas/booking-1' }));

      expect(api.sentBodies[0]).not.toHaveProperty('auto_return');
    });

    it('lets the checkout expire when the turn hold ends', async () => {
      const api = new FakeMercadoPagoApi();
      const clock = { now: () => new Date('2026-10-17T15:00:00Z') };

      await new MercadoPagoGateway(api, secret, clock).createCheckout(request({ expiresAt: new Date('2026-10-17T15:30:00Z') }));

      expect(api.sentBodies[0]).toMatchObject({
        expires: true,
        expiration_date_from: '2026-10-17T15:00:00.000Z',
        expiration_date_to: '2026-10-17T15:30:00.000Z',
      });
    });

    it('stamps the expiry start with the real clock when none is given', async () => {
      const api = new FakeMercadoPagoApi();

      await new MercadoPagoGateway(api, secret).createCheckout(request({ expiresAt: new Date(Date.now() + 1_800_000) }));

      expect(Date.parse(String(api.sentBodies[0]?.expiration_date_from))).toBeLessThanOrEqual(Date.now());
    });

    it('excludes cash and bank transfer methods that credit days later when only instant methods are allowed', async () => {
      const api = new FakeMercadoPagoApi();

      await new MercadoPagoGateway(api, secret).createCheckout(request({ instantMethodsOnly: true }));

      expect(api.sentBodies[0]).toMatchObject({ payment_methods: { excluded_payment_types: [{ id: 'ticket' }, { id: 'atm' }] } });
    });

    it('does not expire nor exclude methods for a booking without a held turn', async () => {
      const api = new FakeMercadoPagoApi();

      await new MercadoPagoGateway(api, secret).createCheckout(request());

      expect(api.sentBodies[0]).not.toHaveProperty('expires');
      expect(api.sentBodies[0]).not.toHaveProperty('payment_methods');
    });

    it('fails when Mercado Pago answers without an init point', async () => {
      const gateway = new MercadoPagoGateway(new FakeMercadoPagoApi({ id: 'pref-1' }), secret);

      await expect(gateway.createCheckout(request())).rejects.toThrow('Mercado Pago did not return the checkout');
    });

    it('fails when Mercado Pago answers without a preference id', async () => {
      const gateway = new MercadoPagoGateway(new FakeMercadoPagoApi({ init_point: 'https://mp.test/pay/pref-1' }), secret);

      await expect(gateway.createCheckout(request())).rejects.toThrow('Mercado Pago did not return the checkout');
    });
  });

  describe('fetchPayment', () => {
    const fetchWith = (payment: PaymentResult) => new MercadoPagoGateway(new FakeMercadoPagoApi(undefined, payment), secret).fetchPayment('123456');

    it('maps an approved payment with its reference, amount in cents and currency', async () => {
      const payment = { id: 123456, status: 'approved', external_reference: 'pay-1', transaction_amount: 47_500.5, currency_id: 'ARS' };

      expect(await fetchWith(payment)).toEqual({
        externalPaymentId: '123456',
        reference: 'pay-1',
        status: 'approved',
        amountCents: 4_750_050,
        currency: 'ARS',
        raw: payment,
      });
    });

    it('requests the payment by its external id', async () => {
      const api = new FakeMercadoPagoApi(undefined, { id: 123456, status: 'approved' });

      await new MercadoPagoGateway(api, secret).fetchPayment('123456');

      expect(api.requestedPaymentIds).toEqual(['123456']);
    });

    it.each([
      ['pending', 'pending'],
      ['in_process', 'pending'],
      ['authorized', 'pending'],
      ['in_mediation', 'pending'],
      ['rejected', 'rejected'],
      ['cancelled', 'cancelled'],
      ['refunded', 'refunded'],
      ['charged_back', 'refunded'],
      ['something_new', 'pending'],
    ])('maps Mercado Pago status %s to %s', async (mercadoPagoStatus, expected) => {
      expect((await fetchWith({ id: 1, status: mercadoPagoStatus })).status).toBe(expected);
    });

    it('defaults to pending, empty reference, empty currency and zero amount when fields are missing', async () => {
      expect(await fetchWith({ id: 'abc' })).toMatchObject({ status: 'pending', reference: '', currency: '', amountCents: 0, externalPaymentId: 'abc' });
    });

    it('treats a payment without status as pending', async () => {
      expect((await fetchWith({ id: 'abc', external_reference: 'pay-1' })).status).toBe('pending');
    });
  });

  describe('parseNotification', () => {
    const gateway = new MercadoPagoGateway(new FakeMercadoPagoApi(), secret);

    it('returns the payment id when the signature is valid', () => {
      expect(gateway.parseNotification(signedNotification())).toBe('123456');
    });

    it('reads the type from the topic query param', () => {
      const notification = signedNotification();
      notification.query = { topic: 'payment', 'data.id': '123456' };

      expect(gateway.parseNotification(notification)).toBe('123456');
    });

    it('reads type and data id from the body when the query lacks them', () => {
      const notification = signedNotification();
      notification.query = {};
      notification.body = { type: 'payment', data: { id: 123456 } };

      expect(gateway.parseNotification(notification)).toBe('123456');
    });

    it('lowercases the data id when building the manifest', () => {
      expect(gateway.parseNotification(signedNotification('ABC123'))).toBe('ABC123');
    });

    it('rejects a signature computed with another secret', () => {
      const notification = signedNotification();
      notification.headers['x-signature'] = `ts=1700000000,v1=${sign('123456', 'req-1', '1700000000', 'other')}`;

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects a signature of different length', () => {
      const notification = signedNotification();
      notification.headers['x-signature'] = 'ts=1700000000,v1=abc';

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects a signature of the right length with a wrong value', () => {
      const notification = signedNotification();
      notification.headers['x-signature'] = `ts=1700000000,v1=${'0'.repeat(64)}`;

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects when the webhook secret is not configured', () => {
      expect(new MercadoPagoGateway(new FakeMercadoPagoApi(), '').parseNotification(signedNotification())).toBeNull();
    });

    it('ignores merchant order notifications', () => {
      const notification = signedNotification();
      notification.query = { topic: 'merchant_order', 'data.id': '123456' };

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('ignores notifications without any type', () => {
      const notification = signedNotification();
      notification.query = { 'data.id': '123456' };
      notification.body = null;

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects notifications without a data id', () => {
      const notification = signedNotification();
      notification.query = { type: 'payment' };
      notification.body = { data: {} };

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects notifications with an empty data id', () => {
      const notification = signedNotification();
      notification.query = { type: 'payment', 'data.id': '' };

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects a null data id in the body', () => {
      const notification = signedNotification();
      notification.query = {};
      notification.body = { type: 'payment', data: { id: null } };

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects notifications without signature headers', () => {
      const notification = signedNotification();
      notification.headers = {};

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects notifications without a request id', () => {
      const notification = signedNotification();
      notification.headers = { 'x-signature': notification.headers['x-signature'] as string };

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects a signature header missing the timestamp', () => {
      const notification = signedNotification();
      notification.headers['x-signature'] = 'v1=abc';

      expect(gateway.parseNotification(notification)).toBeNull();
    });

    it('rejects a signature header missing the hash', () => {
      const notification = signedNotification();
      notification.headers['x-signature'] = 'ts=1700000000';

      expect(gateway.parseNotification(notification)).toBeNull();
    });
  });
});
