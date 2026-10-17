import type { BookingSchedule } from '@/domain/booking/BookingSchedule';
import type { PaymentPlan } from '@/domain/payment/PaymentPlan';
import type { BookingState } from './BookingState';

export interface BookingStatusView {
  id: string;
  offerSlug: string;
  offerTitle: string;
  paymentPlan: PaymentPlan;
  schedule: BookingSchedule;
  totalCents: number;
  depositCents: number;
  paidCents: number;
  balanceCents: number;
  firstName: string;
  state: BookingState;
  expiresAt: Date;
}
