import type { Booking } from '@/domain/booking/Booking';
import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { Clock } from '@/domain/Clock';
import type { PaymentRepository } from '@/domain/payment/PaymentRepository';
import { fail } from '../results/fail';
import { ok } from '../results/ok';
import type { BookingState } from '../results/BookingState';
import type { BookingStatusView } from '../results/BookingStatusView';
import type { Result } from '../results/Result';

export class GetBookingStatus {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly payments: PaymentRepository,
    private readonly clock: Clock,
  ) {}

  async execute(bookingId: string): Promise<Result<BookingStatusView, 'not_found'>> {
    const booking = await this.bookings.findById(bookingId);
    if (!booking) {
      return fail('not_found');
    }
    const attempts = await this.payments.listForBooking(booking.id);
    const paidCents = attempts.filter((payment) => payment.status === 'approved').reduce((sum, payment) => sum + payment.amountCents, 0);
    return ok({
      id: booking.id,
      offerSlug: booking.offerSlug,
      offerTitle: booking.offerTitle,
      paymentPlan: booking.paymentPlan,
      schedule: booking.schedule,
      totalCents: booking.totalCents,
      depositCents: booking.depositCents,
      paidCents,
      balanceCents: Math.max(0, booking.totalCents - paidCents),
      firstName: booking.customer.name.trim().split(/\s+/).slice(0, 1).join(''),
      state: await this.stateOf(booking),
      expiresAt: booking.expiresAt,
    });
  }

  private async stateOf(booking: Booking): Promise<BookingState> {
    if (booking.status !== 'awaiting_payment') {
      return booking.status;
    }
    if (this.clock.now() > booking.expiresAt) {
      return 'expired';
    }
    const payment = await this.payments.findLatestForBooking(booking.id, booking.paymentPlan);
    if (payment?.status === 'approved' || (payment?.status === 'pending' && payment.externalPaymentId !== null)) {
      return 'pending_payment';
    }
    if (payment?.status === 'rejected' || payment?.status === 'cancelled') {
      return 'payment_rejected';
    }
    return 'awaiting_payment';
  }
}
