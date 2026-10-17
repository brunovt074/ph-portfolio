import type { TimeSlot } from '@/domain/booking/TimeSlot';
import type { PaymentPlan } from '@/domain/payment/PaymentPlan';

export interface CreateBookingInput {
  offerSlug: string;
  paymentPlan: PaymentPlan;
  slotStart?: string;
  preferredDate?: string;
  timeSlot?: TimeSlot;
  name: string;
  email: string;
  phone: string;
  notes: string;
}
