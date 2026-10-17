import type { MercadoPagoPaymentResponse } from './MercadoPagoPaymentResponse';
import type { MercadoPagoPreferenceResponse } from './MercadoPagoPreferenceResponse';

export interface MercadoPagoApi {
  createPreference(body: Record<string, unknown>): Promise<MercadoPagoPreferenceResponse>;
  getPayment(id: string): Promise<MercadoPagoPaymentResponse>;
}
