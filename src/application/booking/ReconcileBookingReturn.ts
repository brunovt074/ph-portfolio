import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { ErrorReporter } from '@/domain/ErrorReporter';
import type { PaymentGateways } from '@/domain/payment/PaymentGateways';
import type { PaymentRepository } from '@/domain/payment/PaymentRepository';
import type { ProcessPaymentNotification } from './ProcessPaymentNotification';
import { toError } from './toError';

export class ReconcileBookingReturn {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly payments: PaymentRepository,
    private readonly gateways: PaymentGateways,
    private readonly processNotification: ProcessPaymentNotification,
    private readonly reporter: ErrorReporter,
  ) {}

  async execute(bookingId: string, externalPaymentId: string): Promise<void> {
    const booking = await this.bookings.findById(bookingId);
    if (!booking || booking.status !== 'awaiting_payment') {
      return;
    }
    const attempts = await this.payments.listForBooking(booking.id);
    const provider = attempts.at(-1)?.provider;
    const gateway = provider ? this.gateways.find(provider) : undefined;
    if (!provider || !gateway) {
      return;
    }
    try {
      const remote = await gateway.fetchPayment(externalPaymentId);
      if (attempts.some((attempt) => attempt.id === remote.reference)) {
        await this.processNotification.applyRemote(provider, remote);
      }
    } catch (error) {
      this.reporter.report(toError(error));
    }
  }
}
