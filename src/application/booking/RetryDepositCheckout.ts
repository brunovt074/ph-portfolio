import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { Clock } from '@/domain/Clock';
import type { ErrorReporter } from '@/domain/ErrorReporter';
import type { IdGenerator } from '@/domain/IdGenerator';
import type { Payment } from '@/domain/payment/Payment';
import type { PaymentGateways } from '@/domain/payment/PaymentGateways';
import type { PaymentRepository } from '@/domain/payment/PaymentRepository';
import { fail } from '../results/fail';
import { ok } from '../results/ok';
import type { Result } from '../results/Result';
import type { RetriedCheckout } from '../results/RetriedCheckout';
import type { RetryDepositError } from '../results/RetryDepositError';
import type { BookingConfig } from './BookingConfig';
import { openCheckout } from './openCheckout';
import { toError } from './toError';

export class RetryDepositCheckout {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly payments: PaymentRepository,
    private readonly gateways: PaymentGateways,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly reporter: ErrorReporter,
    private readonly config: BookingConfig,
  ) {}

  async execute(bookingId: string): Promise<Result<RetriedCheckout, RetryDepositError>> {
    const booking = await this.bookings.findById(bookingId);
    if (!booking) {
      return fail('not_found');
    }
    const now = this.clock.now();
    if (booking.status !== 'awaiting_payment' || now > booking.expiresAt) {
      return fail('not_retryable');
    }
    const gateway = this.gateways.find(this.gateways.defaultProvider);
    if (!gateway) {
      return fail('gateway_unavailable');
    }
    let payment: Payment;
    try {
      payment = await openCheckout(gateway, this.config, booking, this.ids.next(), now);
    } catch (error) {
      this.reporter.report(toError(error));
      return fail('gateway_unavailable');
    }
    await this.payments.create(payment);
    return ok({ checkoutUrl: payment.checkoutUrl });
  }
}
