import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import type { MercadoPagoApi } from './MercadoPagoApi';
import type { MercadoPagoPaymentResponse } from './MercadoPagoPaymentResponse';
import type { MercadoPagoPreferenceResponse } from './MercadoPagoPreferenceResponse';

type PreferenceBody = Parameters<Preference['create']>[0]['body'];

export class MercadoPagoSdkApi implements MercadoPagoApi {
  private readonly config: MercadoPagoConfig;

  constructor(accessToken: string) {
    this.config = new MercadoPagoConfig({ accessToken });
  }

  createPreference(body: Record<string, unknown>): Promise<MercadoPagoPreferenceResponse> {
    return new Preference(this.config).create({ body: body as unknown as PreferenceBody });
  }

  getPayment(id: string): Promise<MercadoPagoPaymentResponse> {
    return new Payment(this.config).get({ id });
  }
}
