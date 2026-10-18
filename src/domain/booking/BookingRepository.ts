import type { TimeRange } from '../scheduling/TimeRange';
import type { Booking } from './Booking';
import type { BookingStatus } from './BookingStatus';

export interface BookingRepository {
  create(booking: Booking): Promise<void>;
  findById(id: string): Promise<Booking | null>;
  findBlocking(range: TimeRange, now: Date): Promise<Booking[]>;
  update(booking: Booking): Promise<void>;
  transition(booking: Booking, expectedStatus: BookingStatus): Promise<boolean>;
}
