import type { Booking } from '@/domain/booking/Booking';
import type { BookingRow } from '../schema';

const toSchedule = (row: BookingRow): Booking['schedule'] =>
  row.scheduleKind === 'slot'
    ? { kind: 'slot', start: row.slotStart as Date, end: row.slotEnd as Date }
    : { kind: 'request', preferredDate: row.preferredDate as string, timeSlot: row.timeSlot as NonNullable<BookingRow['timeSlot']> };

export const toBooking = (row: BookingRow): Booking => ({
  id: row.id,
  offerSlug: row.offerSlug,
  offerTitle: row.offerTitle,
  totalCents: row.totalCents,
  depositCents: row.depositCents,
  currency: row.currency as Booking['currency'],
  paymentPlan: row.paymentPlan,
  schedule: toSchedule(row),
  calendarEventId: row.calendarEventId,
  customer: { name: row.customerName, email: row.customerEmail, phone: row.customerPhone },
  notes: row.notes,
  status: row.status,
  expiresAt: row.expiresAt,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});
