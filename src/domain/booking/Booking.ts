import type { PaymentPlan } from '../payment/PaymentPlan';
import type { BookingSchedule } from './BookingSchedule';
import type { BookingStatus } from './BookingStatus';
import type { Customer } from './Customer';

export interface Booking {
  id: string;
  offerSlug: string;
  offerTitle: string;
  totalCents: number;
  depositCents: number;
  currency: 'ARS';
  paymentPlan: PaymentPlan;
  schedule: BookingSchedule;
  calendarEventId: string | null;
  customer: Customer;
  notes: string;
  status: BookingStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
