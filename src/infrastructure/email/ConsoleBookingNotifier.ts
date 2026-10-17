import type { Booking } from '@/domain/booking/Booking';
import type { BookingNotifier } from '@/domain/booking/BookingNotifier';

export class ConsoleBookingNotifier implements BookingNotifier {
  constructor(private readonly log: (line: string) => void = console.info) {}

  async paymentConfirmed(booking: Booking): Promise<void> {
    this.log(`[booking] payment confirmed ${booking.id}`);
  }

  async slotConflict(booking: Booking): Promise<void> {
    this.log(`[booking] slot conflict ${booking.id}`);
  }

  async duplicatePayment(booking: Booking): Promise<void> {
    this.log(`[booking] duplicate payment ${booking.id}`);
  }

  async paymentRefunded(booking: Booking): Promise<void> {
    this.log(`[booking] payment refunded ${booking.id}`);
  }
}
