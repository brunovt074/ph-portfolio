import { and, eq, gt, inArray, lt, or } from 'drizzle-orm';
import type { Booking } from '@/domain/booking/Booking';
import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { BookingStatus } from '@/domain/booking/BookingStatus';
import type { TimeRange } from '@/domain/scheduling/TimeRange';
import type { Database } from './Database';
import { isUuid } from './isUuid';
import { toBooking } from './mapping/toBooking';
import { toBookingRow } from './mapping/toBookingRow';
import { bookings } from './schema';

export class DrizzleBookingRepository implements BookingRepository {
  constructor(private readonly db: Database) {}

  async create(booking: Booking): Promise<void> {
    await this.db.insert(bookings).values(toBookingRow(booking));
  }

  async findById(id: string): Promise<Booking | null> {
    if (!isUuid(id)) {
      return null;
    }
    const [row] = await this.db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    return row ? toBooking(row) : null;
  }

  async findBlocking(range: TimeRange, now: Date): Promise<Booking[]> {
    const rows = await this.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.scheduleKind, 'slot'),
          lt(bookings.slotStart, range.end),
          gt(bookings.slotEnd, range.start),
          or(
            inArray(bookings.status, ['confirmed', 'needs_rescheduling']),
            and(eq(bookings.status, 'awaiting_payment'), gt(bookings.expiresAt, now)),
          ),
        ),
      );
    return rows.map(toBooking);
  }

  async update(booking: Booking): Promise<void> {
    await this.db.update(bookings).set(this.changesOf(booking)).where(eq(bookings.id, booking.id));
  }

  async transition(booking: Booking, expectedStatus: BookingStatus): Promise<boolean> {
    const rows = await this.db
      .update(bookings)
      .set(this.changesOf(booking))
      .where(and(eq(bookings.id, booking.id), eq(bookings.status, expectedStatus)))
      .returning({ id: bookings.id });
    return rows.length > 0;
  }

  private changesOf(booking: Booking) {
    return {
      status: booking.status,
      notes: booking.notes,
      expiresAt: booking.expiresAt,
      calendarEventId: booking.calendarEventId,
      updatedAt: new Date(),
    };
  }
}
