import { MercadoPagoGateway } from './mercadopago/MercadoPagoGateway';
import { MercadoPagoSdkApi } from './mercadopago/MercadoPagoSdkApi';
import type { PaymentGatewaysConfig } from './PaymentGatewaysConfig';
import type { PaymentGatewaysSetup } from './PaymentGatewaysSetup';
import { RegisteredPaymentGateways } from './RegisteredPaymentGateways';
import { SimulatedPaymentGateway } from './simulated/SimulatedPaymentGateway';

export const createPaymentGateways = ({
  provider,
  mercadoPagoAccessToken,
  mercadoPagoWebhookSecret,
  siteUrl,
}: PaymentGatewaysConfig): PaymentGatewaysSetup => {
  const gateways = new RegisteredPaymentGateways(provider || 'mercadopago');
  if (mercadoPagoAccessToken) {
    gateways.register(new MercadoPagoGateway(new MercadoPagoSdkApi(mercadoPagoAccessToken), mercadoPagoWebhookSecret ?? ''));
  }
  if (provider !== 'simulado') {
    return { gateways, simulated: null };
  }
  console.warn('[payments] modo simulado activo: no usar en producción');
  const simulated = new SimulatedPaymentGateway(siteUrl);
  gateways.register(simulated);
  return { gateways, simulated };
};
