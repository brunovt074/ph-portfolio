import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPaymentGateways } from '@/infrastructure/payments/createPaymentGateways';

const base = { provider: undefined, mercadoPagoAccessToken: undefined, mercadoPagoWebhookSecret: undefined, siteUrl: 'http://localhost:4321' };

describe('createPaymentGateways', () => {
  afterEach(() => vi.restoreAllMocks());

  it('registers Mercado Pago as the default when the access token is configured', () => {
    const { gateways, simulated } = createPaymentGateways({ ...base, mercadoPagoAccessToken: 'token', mercadoPagoWebhookSecret: 'secret' });

    expect(gateways.defaultProvider).toBe('mercadopago');
    expect(gateways.find('mercadopago')?.provider).toBe('mercadopago');
    expect(gateways.find('simulado')).toBeUndefined();
    expect(simulated).toBeNull();
  });

  it('registers Mercado Pago even without a webhook secret, which will refuse every notification', () => {
    const { gateways } = createPaymentGateways({ ...base, provider: 'mercadopago', mercadoPagoAccessToken: 'token' });

    const gateway = gateways.find('mercadopago');

    expect(gateway?.parseNotification({ headers: {}, query: { type: 'payment', 'data.id': '1' }, body: null })).toBeNull();
  });

  it('registers nothing when no credentials are configured', () => {
    const { gateways } = createPaymentGateways(base);

    expect(gateways.defaultProvider).toBe('mercadopago');
    expect(gateways.find('mercadopago')).toBeUndefined();
  });

  it('activates the simulator with a production warning when asked for', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { gateways, simulated } = createPaymentGateways({ ...base, provider: 'simulado' });

    expect(gateways.defaultProvider).toBe('simulado');
    expect(gateways.find('simulado')).toBe(simulated);
    expect(simulated?.provider).toBe('simulado');
    expect(warn).toHaveBeenCalledWith('[payments] modo simulado activo: no usar en producción');
  });

  it('can run the simulator next to Mercado Pago', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { gateways } = createPaymentGateways({ ...base, provider: 'simulado', mercadoPagoAccessToken: 'token' });

    expect(gateways.find('mercadopago')).toBeDefined();
    expect(gateways.find('simulado')).toBeDefined();
  });
});
