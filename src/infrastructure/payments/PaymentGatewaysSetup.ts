import type { RegisteredPaymentGateways } from './RegisteredPaymentGateways';
import type { SimulatedPaymentGateway } from './simulated/SimulatedPaymentGateway';

export interface PaymentGatewaysSetup {
  gateways: RegisteredPaymentGateways;
  simulated: SimulatedPaymentGateway | null;
}
