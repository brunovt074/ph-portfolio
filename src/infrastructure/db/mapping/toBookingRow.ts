import type { Booking } from '@/domain/booking/Booking';
import type { BookingRow } from '../schema';

type ScheduleColumns = Pick<BookingRow, 'scheduleKind' | 'slotStart' | 'slotEnd' | 'preferredDate' | 'timeSlot'>;

const toScheduleColumns = (schedule: Booking['schedule']): ScheduleColumns =>
  schedule.kind === 'slot'
    ? { scheduleKind: 'slot', slotStart: schedule.start, slotEnd: schedule.end, preferredDate: null, timeSlot: null }
    : { scheduleKind: 'request', slotStart: null, slotEnd: null, preferredDate: schedule.preferredDate, timeSlot: schedule.timeSlot };

export const toBookingRow = (booking: Booking): BookingRow => ({
  id: booking.id,
  offerSlug: booking.offerSlug,
  offerTitle: booking.offerTitle,
  totalCents: booking.totalCents,
  depositCents: booking.depositCents,
  currency: booking.currency,
  paymentPlan: booking.paymentPlan,
  ...toScheduleColumns(booking.schedule),
  calendarEventId: booking.calendarEventId,
  customerName: booking.customer.name,
  customerEmail: booking.customer.email,
  customerPhone: booking.customer.phone,
  notes: booking.notes,
  status: booking.status,
  expiresAt: booking.expiresAt,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});
