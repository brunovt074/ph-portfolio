import type { Booking } from '@/domain/booking/Booking';
import type { BookingNotifier } from '@/domain/booking/BookingNotifier';

export class RecordingNotifier implements BookingNotifier {
  readonly confirmed: Booking[] = [];
  readonly conflicts: Booking[] = [];
  readonly duplicates: Booking[] = [];
  readonly refunds: Booking[] = [];

  constructor(private readonly failure: Error | null = null) {}

  async paymentConfirmed(booking: Booking): Promise<void> {
    if (this.failure) {
      throw this.failure;
    }
    this.confirmed.push(booking);
  }

  async slotConflict(booking: Booking): Promise<void> {
    if (this.failure) {
      throw this.failure;
    }
    this.conflicts.push(booking);
  }

  async duplicatePayment(booking: Booking): Promise<void> {
    if (this.failure) {
      throw this.failure;
    }
    this.duplicates.push(booking);
  }

  async paymentRefunded(booking: Booking): Promise<void> {
    if (this.failure) {
      throw this.failure;
    }
    this.refunds.push(booking);
  }
}
