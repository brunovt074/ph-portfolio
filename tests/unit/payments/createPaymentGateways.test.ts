import { afterEach, describe, expect, it, vi } from 'vitest';
import { PaymentConfigurationError } from '@/infrastructure/payments/PaymentConfigurationError';
import { createPaymentGateways } from '@/infrastructure/payments/createPaymentGateways';

const base = { provider: undefined, mercadoPagoAccessToken: undefined, mercadoPagoWebhookSecret: undefined, siteUrl: 'http://localhost:4321', bookingDemo: false };
const production = { siteUrl: 'https://sarahmoreau.example', mercadoPagoAccessToken: 'token', mercadoPagoWebhookSecret: 'secret' };

describe('createPaymentGateways', () => {
  afterEach(() => vi.restoreAllMocks());

  it('registers Mercado Pago as the default when the access token is configured', () => {
    const { gateways, simulated } = createPaymentGateways({ ...base, mercadoPagoAccessToken: 'token', mercadoPagoWebhookSecret: 'secret' });

    expect(gateways.defaultProvider).toBe('mercadopago');
    expect(gateways.find('mercadopago')?.provider).toBe('mercadopago');
    expect(gateways.find('simulado')).toBeUndefined();
    expect(simulated).toBeNull();
  });

  it('refuses to start with a Mercado Pago token and no webhook secret, because every payment would go unconfirmed', () => {
    expect(() => createPaymentGateways({ ...base, ...production, mercadoPagoWebhookSecret: undefined })).toThrow(PaymentConfigurationError);
    expect(() => createPaymentGateways({ ...base, ...production, mercadoPagoWebhookSecret: '' })).toThrow('MERCADOPAGO_WEBHOOK_SECRET');
  });

  it('refuses to start with Mercado Pago and no SITE_URL, because return and notification urls would point at localhost', () => {
    expect(() => createPaymentGateways({ ...base, ...production, siteUrl: undefined })).toThrow('SITE_URL');
  });

  it('starts in production with Mercado Pago, secret and public site url', () => {
    const { gateways } = createPaymentGateways({ ...base, ...production });

    expect(gateways.find('mercadopago')).toBeDefined();
  });

  it.each([
    ['the simulator', { provider: 'simulado' }],
    ['demo prices', { bookingDemo: true }],
  ])('refuses %s together with a Mercado Pago token', (_name, flags) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(() => createPaymentGateways({ ...base, ...production, siteUrl: 'http://localhost:4321', ...flags })).toThrow('cannot be combined');
  });

  it.each([
    ['the simulator', { provider: 'simulado' }],
    ['demo prices', { bookingDemo: true }],
  ])('refuses %s on a public site url', (_name, flags) => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(() => createPaymentGateways({ ...base, siteUrl: 'https://sarahmoreau.example', ...flags })).toThrow('only allowed');
    expect(() => createPaymentGateways({ ...base, siteUrl: 'not a url', ...flags })).toThrow('only allowed');
  });

  it('allows the simulator on 127.0.0.1 and without a SITE_URL', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(createPaymentGateways({ ...base, provider: 'simulado', siteUrl: 'http://127.0.0.1:4321' }).simulated).not.toBeNull();
    expect(createPaymentGateways({ ...base, provider: 'simulado', siteUrl: undefined }).simulated).not.toBeNull();
  });

  it('warns at startup when demo prices are active', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    createPaymentGateways({ ...base, bookingDemo: true });

    expect(warn).toHaveBeenCalledWith('[booking] precios de demostración activos: no usar en producción');
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
});
