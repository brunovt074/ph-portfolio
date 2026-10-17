import type { Payment } from '@/domain/payment/Payment';
import type { PaymentKind } from '@/domain/payment/PaymentKind';
import type { PaymentRepository } from '@/domain/payment/PaymentRepository';

export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly stored: Payment[] = [];

  async create(payment: Payment): Promise<void> {
    this.stored.push(payment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.stored.find((payment) => payment.id === id) ?? null;
  }

  async findLatestForBooking(bookingId: string, kind: PaymentKind): Promise<Payment | null> {
    const matching = this.stored.filter((payment) => payment.bookingId === bookingId && payment.kind === kind);
    return matching.at(-1) ?? null;
  }

  async listForBooking(bookingId: string): Promise<Payment[]> {
    return this.stored.filter((payment) => payment.bookingId === bookingId);
  }

  async update(payment: Payment): Promise<void> {
    const index = this.stored.findIndex((candidate) => candidate.id === payment.id);
    this.stored[index] = payment;
  }

  all(): Payment[] {
    return [...this.stored];
  }
}
