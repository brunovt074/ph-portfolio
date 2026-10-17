import { date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { bookingStatuses } from '@/domain/booking/BookingStatus';
import { scheduleKinds } from '@/domain/booking/ScheduleKind';
import { timeSlots } from '@/domain/booking/TimeSlot';
import { paymentKinds } from '@/domain/payment/PaymentKind';
import { paymentPlans } from '@/domain/payment/PaymentPlan';
import { paymentStatuses } from '@/domain/payment/PaymentStatus';

export const bookingStatusEnum = pgEnum('booking_status', bookingStatuses);
export const scheduleKindEnum = pgEnum('schedule_kind', scheduleKinds);
export const timeSlotEnum = pgEnum('time_slot', timeSlots);
export const paymentPlanEnum = pgEnum('payment_plan', paymentPlans);
export const paymentKindEnum = pgEnum('payment_kind', paymentKinds);
export const paymentStatusEnum = pgEnum('payment_status', paymentStatuses);

export const bookings = pgTable(
  'bookings',
  {
    id: uuid('id').primaryKey(),
    offerSlug: text('offer_slug').notNull(),
    offerTitle: text('offer_title').notNull(),
    totalCents: integer('total_cents').notNull(),
    depositCents: integer('deposit_cents').notNull(),
    currency: text('currency').notNull(),
    paymentPlan: paymentPlanEnum('payment_plan').notNull(),
    scheduleKind: scheduleKindEnum('schedule_kind').notNull(),
    slotStart: timestamp('slot_start', { withTimezone: true }),
    slotEnd: timestamp('slot_end', { withTimezone: true }),
    preferredDate: date('preferred_date', { mode: 'string' }),
    timeSlot: timeSlotEnum('time_slot'),
    calendarEventId: text('calendar_event_id'),
    customerName: text('customer_name').notNull(),
    customerEmail: text('customer_email').notNull(),
    customerPhone: text('customer_phone').notNull(),
    notes: text('notes').notNull(),
    status: bookingStatusEnum('status').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('bookings_slot_idx').on(table.slotStart, table.slotEnd)],
);

export const payments = pgTable(
  'payments',
  {
    id: uuid('id').primaryKey(),
    bookingId: uuid('booking_id')
      .notNull()
      .references(() => bookings.id, { onDelete: 'cascade' }),
    kind: paymentKindEnum('kind').notNull(),
    provider: text('provider').notNull(),
    checkoutId: text('checkout_id').notNull(),
    checkoutUrl: text('checkout_url').notNull(),
    externalPaymentId: text('external_payment_id'),
    status: paymentStatusEnum('status').notNull(),
    amountCents: integer('amount_cents').notNull(),
    currency: text('currency').notNull(),
    raw: jsonb('raw').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('payments_booking_idx').on(table.bookingId, table.kind, table.createdAt)],
);

export type BookingRow = typeof bookings.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
