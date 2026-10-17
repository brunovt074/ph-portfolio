import type { BookingLock } from '@/domain/scheduling/BookingLock';

export class ImmediateBookingLock implements BookingLock {
  runs = 0;

  runExclusive<T>(task: () => Promise<T>): Promise<T> {
    this.runs += 1;
    return task();
  }
}
