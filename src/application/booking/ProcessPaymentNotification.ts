import type { Booking } from '@/domain/booking/Booking';
import type { BookingStatus } from '@/domain/booking/BookingStatus';
import type { BookingNotifier } from '@/domain/booking/BookingNotifier';
import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { Clock } from '@/domain/Clock';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { ErrorReporter } from '@/domain/ErrorReporter';
import type { GatewayPayment } from '@/domain/payment/GatewayPayment';
import type { IncomingNotification } from '@/domain/payment/IncomingNotification';
import type { Payment } from '@/domain/payment/Payment';
import type { PaymentStatus } from '@/domain/payment/PaymentStatus';
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
    const parsed = gateway.parseNotification(notification);
    if (parsed.kind === 'ignored') {
      return ok({ outcome: 'ignored' });
    }
    if (parsed.kind === 'invalid') {
      this.reporter.report(new Error('[payments] rejected webhook signature'));
      return fail('invalid_notification');
    }
    const remote = await gateway.fetchPayment(parsed.externalPaymentId);
    return ok(await this.applyRemote(provider, remote));
  }

  async applyRemote(provider: string, remote: GatewayPayment): Promise<ProcessedNotification> {
    const payment = await this.payments.findById(remote.reference);
    if (!payment || payment.provider !== provider) {
      return { outcome: 'ignored' };
    }
    const mismatch = this.hasAmountMismatch(remote, payment);
    const status = mismatch ? 'rejected' : remote.status;
    if (this.isSuperseded(payment, remote, status)) {
      return { outcome: 'unchanged' };
    }
    const recorded = payment.externalPaymentId === remote.externalPaymentId && payment.status === status;
    if (recorded && !(status === 'approved' && this.isBookingPayment(payment))) {
      return { outcome: 'unchanged' };
    }
    const updated: Payment = { ...payment, externalPaymentId: remote.externalPaymentId, status, raw: remote.raw };
    if (!recorded) {
      await this.payments.update(updated);
    }
    if (mismatch) {
      this.reporter.report(new Error(`[payments] amount mismatch ${payment.id}`));
      return { outcome: 'amount_mismatch' };
    }
    if (!this.isBookingPayment(updated)) {
      return { outcome: 'updated' };
    }
    if (status === 'approved') {
      return { outcome: await this.settle(updated, recorded) };
    }
    if (status === 'refunded' && payment.status === 'approved') {
      await this.announceRefund(updated);
    }
    return { outcome: 'updated' };
  }

  private isSuperseded(payment: Payment, remote: GatewayPayment, status: PaymentStatus): boolean {
    if (payment.status !== 'approved' || status === 'approved') {
      return false;
    }
    return !(status === 'refunded' && payment.externalPaymentId === remote.externalPaymentId);
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

  private async settle(payment: Payment, recorded: boolean): Promise<NotificationOutcome> {
    const booking = await this.bookings.findById(payment.bookingId);
    if (!booking) {
      return 'updated';
    }
    if (booking.status !== 'awaiting_payment') {
      if (recorded) {
        return 'unchanged';
      }
      this.reporter.report(new Error(`[payments] duplicate payment ${payment.id}`));
      await this.notify(() => this.notifier.duplicatePayment(booking, payment));
      return 'duplicate';
    }
    const schedule = booking.schedule;
    const range = schedule.kind === 'slot' ? { start: schedule.start, end: schedule.end } : null;
    const claim = range ? await this.claimSlot(booking, range) : await this.claimTo(booking, 'confirmed');
    if (!claim) {
      return 'unchanged';
    }
    if (claim.status === 'needs_rescheduling') {
      await this.notify(() => this.notifier.slotConflict(claim, payment));
      return 'updated';
    }
    const confirmed = range ? await this.attachCalendarEvent(claim, payment, range) : claim;
    await this.notify(() => this.notifier.paymentConfirmed(confirmed, payment));
    return 'updated';
  }

  private async claimSlot(booking: Booking, range: TimeRange): Promise<Booking | null> {
    const settings = await this.content.getSchedulingSettings();
    return this.lock.runExclusive(async () => {
      const free = await this.isStillFree(booking, range, settings);
      return this.claimTo(booking, free ? 'confirmed' : 'needs_rescheduling');
    });
  }

  private async claimTo(booking: Booking, status: BookingStatus): Promise<Booking | null> {
    const next: Booking = { ...booking, status };
    return (await this.bookings.transition(next, 'awaiting_payment')) ? next : null;
  }

  private async attachCalendarEvent(booking: Booking, payment: Payment, range: TimeRange): Promise<Booking> {
    const calendarEventId = await this.createEvent(booking, payment, range);
    if (calendarEventId === null) {
      return booking;
    }
    const withEvent: Booking = { ...booking, calendarEventId };
    await this.notify(() => this.bookings.update(withEvent));
    return withEvent;
  }

  private async isStillFree(booking: Booking, range: TimeRange, settings: SchedulingSettings): Promise<boolean> {
    const query = { settings, range, now: this.clock.now(), excludeBookingId: booking.id };
    try {
      return await this.availability.isFree(query);
    } catch (error) {
      this.reporter.report(toError(error));
      return this.availability.isFreeOfSiteBookings(query);
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

  private async notify(send: () => Promise<unknown>): Promise<void> {
    try {
      await send();
    } catch (error) {
      this.reporter.report(toError(error));
    }
  }
}
