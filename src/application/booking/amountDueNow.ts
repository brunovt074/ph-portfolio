import type { Booking } from '@/domain/booking/Booking';

export const amountDueNow = (booking: Booking): number => (booking.paymentPlan === 'full' ? booking.totalCents : booking.depositCents);
