import type { Booking } from '@/domain/booking/Booking';
import type { BookingNotifier } from '@/domain/booking/BookingNotifier';
import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { Clock } from '@/domain/Clock';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { ErrorReporter } from '@/domain/ErrorReporter';
import type { GatewayPayment } from '@/domain/payment/GatewayPayment';
import type { IncomingNotification } from '@/domain/payment/IncomingNotification';
import type { Payment } from '@/domain/payment/Payment';
import type { PaymentGateways } from '@/domain/payment/PaymentGateways';
import type { PaymentRepository } from '@/domain/payment/PaymentRepository';
import type { BookingLock } from '@/domain/scheduling/BookingLock';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { TimeRange } from '@/domain/scheduling/TimeRange';
import { fail } from '../results/fail';
import { ok } from '../results/ok';
import type { ProcessedNotification } from '../results/ProcessedNotification';
import type { NotificationOutcome } from '../results/NotificationOutcome';
import type { ProcessNotificationError } from '../results/ProcessNotificationError';
import type { Result } from '../results/Result';
import type { SlotAvailability } from '../scheduling/SlotAvailability';
import { toError } from './toError';

export class ProcessPaymentNotification {
  constructor(
    private readonly bookings: BookingRepository,
    private readonly payments: PaymentRepository,
    private readonly gateways: PaymentGateways,
    private readonly notifier: BookingNotifier,
    private readonly reporter: ErrorReporter,
    private readonly content: ContentRepository,
    private readonly availability: SlotAvailability,
    private readonly calendar: CalendarProvider | null,
    private readonly lock: BookingLock,
    private readonly clock: Clock,
  ) {}

  async execute(provider: string, notification: IncomingNotification): Promise<Result<ProcessedNotification, ProcessNotificationError>> {
    const gateway = this.gateways.find(provider);
    if (!gateway) {
      return fail('unknown_provider');
    }
    const externalPaymentId = gateway.parseNotification(notification);
    if (externalPaymentId === null) {
      return fail('invalid_notification');
    }
    const remote = await gateway.fetchPayment(externalPaymentId);
    return ok(await this.lock.runExclusive(() => this.apply(provider, remote)));
  }

  private async apply(provider: string, remote: GatewayPayment): Promise<ProcessedNotification> {
    const payment = await this.payments.findById(remote.reference);
    if (!payment || payment.provider !== provider) {
      return { outcome: 'ignored' };
    }
    const mismatch = this.hasAmountMismatch(remote, payment);
    const status = mismatch ? 'rejected' : remote.status;
    if (payment.externalPaymentId === remote.externalPaymentId && payment.status === status) {
      return { outcome: 'unchanged' };
    }
    const updated: Payment = { ...payment, externalPaymentId: remote.externalPaymentId, status, raw: remote.raw };
    await this.payments.update(updated);
    if (mismatch) {
      this.reporter.report(new Error(`[payments] amount mismatch ${payment.id}`));
      return { outcome: 'amount_mismatch' };
    }
    if (!this.isBookingPayment(updated)) {
      return { outcome: 'updated' };
    }
    if (status === 'approved') {
      return { outcome: await this.settle(updated) };
    }
    if (status === 'refunded' && payment.status === 'approved') {
      await this.announceRefund(updated);
    }
    return { outcome: 'updated' };
  }

  private isBookingPayment(payment: Payment): boolean {
    return payment.kind === 'deposit' || payment.kind === 'full';
  }

  private async announceRefund(payment: Payment): Promise<void> {
    const booking = await this.bookings.findById(payment.bookingId);
    if (booking) {
      await this.notify(() => this.notifier.paymentRefunded(booking, payment));
    }
  }

  private hasAmountMismatch(remote: GatewayPayment, payment: Payment): boolean {
    return remote.status === 'approved' && (remote.amountCents !== payment.amountCents || remote.currency !== payment.currency);
  }

  private async settle(payment: Payment): Promise<NotificationOutcome> {
    const booking = await this.bookings.findById(payment.bookingId);
    if (!booking) {
      return 'updated';
    }
    if (booking.status !== 'awaiting_payment') {
      this.reporter.report(new Error(`[payments] duplicate payment ${payment.id}`));
      await this.notify(() => this.notifier.duplicatePayment(booking, payment));
      return 'duplicate';
    }
    const schedule = booking.schedule;
    if (schedule.kind === 'request') {
      await this.confirm(booking, payment, null);
    } else {
      await this.settleSlot(booking, { start: schedule.start, end: schedule.end }, payment);
    }
    return 'updated';
  }

  private async settleSlot(booking: Booking, range: TimeRange, payment: Payment): Promise<void> {
    const settings = await this.content.getSchedulingSettings();
    const free = await this.isStillFree(booking, range, settings);
    if (!free) {
      const conflicted: Booking = { ...booking, status: 'needs_rescheduling' };
      await this.bookings.update(conflicted);
      await this.notify(() => this.notifier.slotConflict(conflicted, payment));
      return;
    }
    await this.confirm(booking, payment, await this.createEvent(booking, payment, range));
  }

  private async isStillFree(booking: Booking, range: TimeRange, settings: SchedulingSettings): Promise<boolean> {
    try {
      return await this.availability.isFree({ settings, range, now: this.clock.now(), excludeBookingId: booking.id });
    } catch (error) {
      this.reporter.report(toError(error));
      return true;
    }
  }

  private async createEvent(booking: Booking, payment: Payment, range: TimeRange): Promise<string | null> {
    if (!this.calendar) {
      return null;
    }
    try {
      return await this.calendar.createEvent({
        bookingId: booking.id,
        start: range.start,
        end: range.end,
        title: `Reserva: ${booking.offerTitle} — ${booking.customer.name}`,
        description: [
          `Email: ${booking.customer.email}`,
          `Teléfono: ${booking.customer.phone}`,
          `Plan: ${booking.paymentPlan === 'full' ? 'pago completo' : 'seña'}`,
          `Pagado: ${payment.currency} ${payment.amountCents / 100}`,
          `Notas: ${booking.notes || 'Sin notas'}`,
          `Reserva: ${booking.id}`,
        ].join('\n'),
      });
    } catch (error) {
      this.reporter.report(toError(error));
      return null;
    }
  }

  private async confirm(booking: Booking, payment: Payment, calendarEventId: string | null): Promise<void> {
    const confirmed: Booking = { ...booking, status: 'confirmed', calendarEventId };
    await this.bookings.update(confirmed);
    await this.notify(() => this.notifier.paymentConfirmed(confirmed, payment));
  }

  private async notify(send: () => Promise<void>): Promise<void> {
    try {
      await send();
    } catch (error) {
      this.reporter.report(toError(error));
    }
  }
}
