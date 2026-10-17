import type { Payment } from './Payment';
import type { PaymentKind } from './PaymentKind';

export interface PaymentRepository {
  create(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  findLatestForBooking(bookingId: string, kind: PaymentKind): Promise<Payment | null>;
  listForBooking(bookingId: string): Promise<Payment[]>;
  update(payment: Payment): Promise<void>;
}
