export interface PaymentGatewaysConfig {
  provider: string | undefined;
  mercadoPagoAccessToken: string | undefined;
  mercadoPagoWebhookSecret: string | undefined;
  siteUrl: string;
}
