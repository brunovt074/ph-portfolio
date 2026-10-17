import { BookingNotificationError } from '@/domain/booking/BookingNotificationError';
import type { BookingNotifier } from '@/domain/booking/BookingNotifier';

export class UnavailableBookingNotifier implements BookingNotifier {
  async paymentConfirmed(): Promise<void> {
    throw new BookingNotificationError('email delivery is not configured');
  }

  async slotConflict(): Promise<void> {
    throw new BookingNotificationError('email delivery is not configured');
  }

  async duplicatePayment(): Promise<void> {
    throw new BookingNotificationError('email delivery is not configured');
  }

  async paymentRefunded(): Promise<void> {
    throw new BookingNotificationError('email delivery is not configured');
  }
}
