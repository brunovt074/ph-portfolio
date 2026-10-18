import { isLocalSiteUrl } from './isLocalSiteUrl';
import { localSiteUrl } from './localSiteUrl';
import { MercadoPagoGateway } from './mercadopago/MercadoPagoGateway';
import { MercadoPagoSdkApi } from './mercadopago/MercadoPagoSdkApi';
import { PaymentConfigurationError } from './PaymentConfigurationError';
import type { PaymentGatewaysConfig } from './PaymentGatewaysConfig';
import type { PaymentGatewaysSetup } from './PaymentGatewaysSetup';
import { RegisteredPaymentGateways } from './RegisteredPaymentGateways';
import { SimulatedPaymentGateway } from './simulated/SimulatedPaymentGateway';

const assertConsistent = ({ provider, mercadoPagoAccessToken, mercadoPagoWebhookSecret, siteUrl, bookingDemo }: PaymentGatewaysConfig): void => {
  const simulated = provider === 'simulado';
  if (mercadoPagoAccessToken && !mercadoPagoWebhookSecret) {
    throw new PaymentConfigurationError('MERCADOPAGO_ACCESS_TOKEN is set but MERCADOPAGO_WEBHOOK_SECRET is missing');
  }
  if (!simulated && mercadoPagoAccessToken && !siteUrl) {
    throw new PaymentConfigurationError('SITE_URL is required to receive Mercado Pago notifications');
  }
  if ((simulated || bookingDemo) && mercadoPagoAccessToken) {
    throw new PaymentConfigurationError('PAYMENT_PROVIDER=simulado and BOOKING_DEMO=true cannot be combined with MERCADOPAGO_ACCESS_TOKEN');
  }
  if ((simulated || bookingDemo) && siteUrl && !isLocalSiteUrl(siteUrl)) {
    throw new PaymentConfigurationError('PAYMENT_PROVIDER=simulado and BOOKING_DEMO=true are only allowed when SITE_URL is localhost or 127.0.0.1');
  }
};

export const createPaymentGateways = (config: PaymentGatewaysConfig): PaymentGatewaysSetup => {
  assertConsistent(config);
  const { provider, mercadoPagoAccessToken, mercadoPagoWebhookSecret, siteUrl, bookingDemo } = config;
  const gateways = new RegisteredPaymentGateways(provider || 'mercadopago');
  if (mercadoPagoAccessToken && mercadoPagoWebhookSecret) {
    gateways.register(new MercadoPagoGateway(new MercadoPagoSdkApi(mercadoPagoAccessToken), mercadoPagoWebhookSecret));
  }
  if (bookingDemo) {
    console.warn('[booking] precios de demostración activos: no usar en producción');
  }
  if (provider !== 'simulado') {
    return { gateways, simulated: null };
  }
  console.warn('[payments] modo simulado activo: no usar en producción');
  const simulated = new SimulatedPaymentGateway(siteUrl ?? localSiteUrl);
  gateways.register(simulated);
  return { gateways, simulated };
};
