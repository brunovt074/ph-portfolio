import type { CreateBooking } from '@/application/booking/CreateBooking';
import type { GetBookingStatus } from '@/application/booking/GetBookingStatus';
import type { ListAvailableSlots } from '@/application/booking/ListAvailableSlots';
import type { ListBookingOffers } from '@/application/booking/ListBookingOffers';
import type { ProcessPaymentNotification } from '@/application/booking/ProcessPaymentNotification';
import type { ReconcileBookingReturn } from '@/application/booking/ReconcileBookingReturn';
import type { RetryDepositCheckout } from '@/application/booking/RetryDepositCheckout';
import type { SimulatedPaymentGateway } from './payments/simulated/SimulatedPaymentGateway';

export interface BookingServices {
  listBookingOffers: ListBookingOffers;
  listAvailableSlots: ListAvailableSlots;
  createBooking: CreateBooking;
  processPaymentNotification: ProcessPaymentNotification;
  getBookingStatus: GetBookingStatus;
  retryDepositCheckout: RetryDepositCheckout;
  reconcileBookingReturn: ReconcileBookingReturn;
  simulatedGateway: SimulatedPaymentGateway | null;
  demoPricing: boolean;
  timeZone: string;
}
