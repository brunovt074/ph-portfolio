import type { Payment } from '../payment/Payment';
import type { Booking } from './Booking';

export interface BookingNotifier {
  paymentConfirmed(booking: Booking, payment: Payment): Promise<void>;
  slotConflict(booking: Booking, payment: Payment): Promise<void>;
  duplicatePayment(booking: Booking, payment: Payment): Promise<void>;
  paymentRefunded(booking: Booking, payment: Payment): Promise<void>;
}
