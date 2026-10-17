import type { BookingLock } from '@/domain/scheduling/BookingLock';

export class InProcessBookingLock implements BookingLock {
  private tail: Promise<unknown> = Promise.resolve();

  runExclusive<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task);
    this.tail = result.catch(() => undefined);
    return result;
  }
}
