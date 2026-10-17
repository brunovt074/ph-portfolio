import { and, asc, desc, eq } from 'drizzle-orm';
import type { Payment } from '@/domain/payment/Payment';
import type { PaymentKind } from '@/domain/payment/PaymentKind';
import type { PaymentRepository } from '@/domain/payment/PaymentRepository';
import type { Database } from './Database';
import { isUuid } from './isUuid';
import { toPayment } from './mapping/toPayment';
import { toPaymentRow } from './mapping/toPaymentRow';
import { payments } from './schema';

export class DrizzlePaymentRepository implements PaymentRepository {
  constructor(private readonly db: Database) {}

  async create(payment: Payment): Promise<void> {
    await this.db.insert(payments).values(toPaymentRow(payment));
  }

  async findById(id: string): Promise<Payment | null> {
    if (!isUuid(id)) {
      return null;
    }
    const [row] = await this.db.select().from(payments).where(eq(payments.id, id)).limit(1);
    return row ? toPayment(row) : null;
  }

  async findLatestForBooking(bookingId: string, kind: PaymentKind): Promise<Payment | null> {
    if (!isUuid(bookingId)) {
      return null;
    }
    const [row] = await this.db
      .select()
      .from(payments)
      .where(and(eq(payments.bookingId, bookingId), eq(payments.kind, kind)))
      .orderBy(desc(payments.createdAt))
      .limit(1);
    return row ? toPayment(row) : null;
  }

  async listForBooking(bookingId: string): Promise<Payment[]> {
    if (!isUuid(bookingId)) {
      return [];
    }
    const rows = await this.db.select().from(payments).where(eq(payments.bookingId, bookingId)).orderBy(asc(payments.createdAt));
    return rows.map(toPayment);
  }

  async update(payment: Payment): Promise<void> {
    await this.db
      .update(payments)
      .set({ externalPaymentId: payment.externalPaymentId, status: payment.status, raw: payment.raw ?? {}, updatedAt: new Date() })
      .where(eq(payments.id, payment.id));
  }
}
