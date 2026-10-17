import type { Booking } from '@/domain/booking/Booking';
import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { TimeRange } from '@/domain/scheduling/TimeRange';

export class InMemoryBookingRepository implements BookingRepository {
  private readonly stored = new Map<string, Booking>();

  async create(booking: Booking): Promise<void> {
    this.stored.set(booking.id, booking);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.stored.get(id) ?? null;
  }

  async findBlocking(range: TimeRange, now: Date): Promise<Booking[]> {
    return this.all().filter((booking) => {
      const { schedule } = booking;
      const holding =
        booking.status === 'confirmed' ||
        booking.status === 'needs_rescheduling' ||
        (booking.status === 'awaiting_payment' && booking.expiresAt > now);
      return holding && schedule.kind === 'slot' && schedule.start < range.end && schedule.end > range.start;
    });
  }

  async update(booking: Booking): Promise<void> {
    this.stored.set(booking.id, booking);
  }

  all(): Booking[] {
    return [...this.stored.values()];
  }
}
