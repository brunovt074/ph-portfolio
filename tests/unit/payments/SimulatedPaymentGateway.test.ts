import { describe, expect, it } from 'vitest';
import type { CheckoutRequest } from '@/domain/payment/CheckoutRequest';
import { SimulatedPaymentGateway } from '@/infrastructure/payments/simulated/SimulatedPaymentGateway';

const request = (overrides: Partial<CheckoutRequest> = {}): CheckoutRequest => ({
  reference: 'pay-1',
  title: 'Seña — Maternidad',
  amountCents: 4_750_000,
  currency: 'ARS',
  payerName: 'Camila Ríos',
  payerEmail: 'camila@example.com',
  returnUrl: 'http://localhost:4321/reservas/booking-1',
  notificationUrl: 'http://localhost:4321/api/payments/webhook/simulado',
  ...overrides,
});

const notificationFor = (paymentId: unknown) => ({ headers: {}, query: {}, body: { paymentId } });

describe('SimulatedPaymentGateway', () => {
  it('opens a checkout page on the simulator and remembers what is being paid', async () => {
    const gateway = new SimulatedPaymentGateway('http://localhost:4321');

    const checkout = await gateway.createCheckout(request());

    expect(checkout).toEqual({ checkoutId: 'sim_1', checkoutUrl: 'http://localhost:4321/reservas/simulador/sim_1' });
    expect(gateway.findCheckout('sim_1')).toEqual({
      checkoutId: 'sim_1',
      reference: 'pay-1',
      amountCents: 4_750_000,
      currency: 'ARS',
      returnUrl: 'http://localhost:4321/reservas/booking-1',
      title: 'Seña — Maternidad',
    });
  });

  it('numbers each new checkout', async () => {
    const gateway = new SimulatedPaymentGateway('http://localhost:4321');

    await gateway.createCheckout(request());
    const second = await gateway.createCheckout(request({ reference: 'pay-2' }));

    expect(second.checkoutId).toBe('sim_2');
  });

  it('does not know a checkout that was never created', () => {
    expect(new SimulatedPaymentGateway('http://localhost:4321').findCheckout('sim_9')).toBeUndefined();
  });

  it('approving a checkout produces an approved payment for the full deposit', async () => {
    const gateway = new SimulatedPaymentGateway('http://localhost:4321');
    await gateway.createCheckout(request());

    const paymentId = gateway.settle('sim_1', 'approved');

    expect(paymentId).toBe('simpay_1');
    expect(await gateway.fetchPayment(paymentId)).toEqual({
      externalPaymentId: 'simpay_1',
      reference: 'pay-1',
      status: 'approved',
      amountCents: 4_750_000,
      currency: 'ARS',
      raw: { simulated: true, checkoutId: 'sim_1', status: 'approved' },
    });
  });

  it('rejecting a checkout produces a rejected payment', async () => {
    const gateway = new SimulatedPaymentGateway('http://localhost:4321');
    await gateway.createCheckout(request());

    const paymentId = gateway.settle('sim_1', 'rejected');

    expect((await gateway.fetchPayment(paymentId)).status).toBe('rejected');
  });

  it('can settle with a different amount to exercise the mismatch protection', async () => {
    const gateway = new SimulatedPaymentGateway('http://localhost:4321');
    await gateway.createCheckout(request());

    const paymentId = gateway.settle('sim_1', 'approved', 100);

    expect((await gateway.fetchPayment(paymentId)).amountCents).toBe(100);
  });

  it('cannot settle a checkout that does not exist', () => {
    expect(() => new SimulatedPaymentGateway('http://localhost:4321').settle('sim_9', 'approved')).toThrow('Unknown simulated checkout sim_9');
  });

  it('cannot fetch a payment that does not exist', async () => {
    await expect(new SimulatedPaymentGateway('http://localhost:4321').fetchPayment('simpay_9')).rejects.toThrow('Unknown simulated payment simpay_9');
  });

  it('accepts a notification that points to a known payment', async () => {
    const gateway = new SimulatedPaymentGateway('http://localhost:4321');
    await gateway.createCheckout(request());
    const paymentId = gateway.settle('sim_1', 'approved');

    expect(gateway.parseNotification(notificationFor(paymentId))).toEqual({ kind: 'payment', externalPaymentId: 'simpay_1' });
  });

  it('refuses a notification for an unknown payment, without body or with a non string id', () => {
    const gateway = new SimulatedPaymentGateway('http://localhost:4321');

    expect(gateway.parseNotification(notificationFor('simpay_9'))).toEqual({ kind: 'invalid' });
    expect(gateway.parseNotification(notificationFor(42))).toEqual({ kind: 'invalid' });
    expect(gateway.parseNotification({ headers: {}, query: {}, body: null })).toEqual({ kind: 'invalid' });
  });
});
