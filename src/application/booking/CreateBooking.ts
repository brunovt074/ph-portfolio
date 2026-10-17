import type { Booking } from '@/domain/booking/Booking';
import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { BookingRepository } from '@/domain/booking/BookingRepository';
import type { BookingSchedule } from '@/domain/booking/BookingSchedule';
import type { Clock } from '@/domain/Clock';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { ErrorReporter } from '@/domain/ErrorReporter';
import type { IdGenerator } from '@/domain/IdGenerator';
import type { Payment } from '@/domain/payment/Payment';
import type { PaymentGateway } from '@/domain/payment/PaymentGateway';
import type { PaymentGateways } from '@/domain/payment/PaymentGateways';
import type { PaymentRepository } from '@/domain/payment/PaymentRepository';
import type { BookingLock } from '@/domain/scheduling/BookingLock';
import { CalendarUnavailableError } from '@/domain/scheduling/CalendarUnavailableError';
import type { CalendarProvider } from '@/domain/scheduling/CalendarProvider';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import type { CreateBookingInput } from '../inputs/CreateBookingInput';
import type { CreatedBooking } from '../results/CreatedBooking';
import type { CreateBookingError } from '../results/CreateBookingError';
import { fail } from '../results/fail';
import { ok } from '../results/ok';
import type { Result } from '../results/Result';
import type { DaySlots } from '../scheduling/DaySlots';
import type { SlotAvailability } from '../scheduling/SlotAvailability';
import { slotDurationFor } from '../scheduling/slotDurationFor';
import { localDateOf } from '../scheduling/zonedTime';
import type { BookingConfig } from './BookingConfig';
import { calculateDeposit } from './calculateDeposit';
import { isBookableDate } from './isBookableDate';
import { openCheckout } from './openCheckout';
import { toError } from './toError';

const HOUR_IN_MILLISECONDS = 3_600_000;
const MINUTE_IN_MILLISECONDS = 60_000;

type Outcome = Result<CreatedBooking, CreateBookingError>;

export class CreateBooking {
  constructor(
    private readonly content: ContentRepository,
    private readonly bookings: BookingRepository,
    private readonly payments: PaymentRepository,
    private readonly gateways: PaymentGateways,
    private readonly clock: Clock,
    private readonly ids: IdGenerator,
    private readonly reporter: ErrorReporter,
    private readonly config: BookingConfig,
    private readonly availability: SlotAvailability,
    private readonly calendar: CalendarProvider | null,
    private readonly lock: BookingLock,
  ) {}

  async execute(input: CreateBookingInput): Promise<Outcome> {
    const offers = await this.content.getBookingOffers();
    const offer = offers.find((candidate) => candidate.slug === input.offerSlug);
    if (!offer) {
      return fail('offer_not_found');
    }
    const totalCents = offer.priceCents ?? 0;
    if (totalCents <= 0) {
      return fail('offer_unavailable');
    }
    const settings = await this.content.getSchedulingSettings();
    const durationMinutes = slotDurationFor(offer, settings, this.calendar);
    if (durationMinutes === null) {
      return this.bookRequest(offer, totalCents, input);
    }
    return this.bookSlot(offer, totalCents, input, settings, durationMinutes);
  }

  private async bookRequest(offer: BookingOffer, totalCents: number, input: CreateBookingInput): Promise<Outcome> {
    const now = this.clock.now();
    const preferredDate = input.preferredDate ?? '';
    if (!isBookableDate(preferredDate, now, this.config)) {
      return fail('invalid_date');
    }
    const schedule: BookingSchedule = { kind: 'request', preferredDate, timeSlot: input.timeSlot ?? 'any' };
    const expiresAt = new Date(now.getTime() + this.config.holdHours * HOUR_IN_MILLISECONDS);
    return this.checkoutAndPersist(this.buildBooking(offer, totalCents, input, schedule, expiresAt, now));
  }

  private async bookSlot(
    offer: BookingOffer,
    totalCents: number,
    input: CreateBookingInput,
    settings: SchedulingSettings,
    durationMinutes: number,
  ): Promise<Outcome> {
    if (!input.slotStart) {
      return fail('slot_required');
    }
    const start = new Date(input.slotStart);
    if (Number.isNaN(start.getTime())) {
      return fail('slot_taken');
    }
    return this.lock.runExclusive(async () => {
      const now = this.clock.now();
      const date = localDateOf(start, settings.timeZone);
      let days: DaySlots[];
      try {
        days = await this.availability.freeSlots({ settings, durationMinutes, from: date, to: date, now });
      } catch (error) {
        if (!(error instanceof CalendarUnavailableError)) {
          throw error;
        }
        this.reporter.report(error);
        return fail('calendar_unavailable');
      }
      const slot = days.flatMap((day) => day.slots).find((candidate) => candidate.start.getTime() === start.getTime());
      if (!slot) {
        return fail('slot_taken');
      }
      const expiresAt = new Date(now.getTime() + settings.holdMinutes * MINUTE_IN_MILLISECONDS);
      return this.checkoutAndPersist(this.buildBooking(offer, totalCents, input, { kind: 'slot', start: slot.start, end: slot.end }, expiresAt, now));
    });
  }

  private buildBooking(
    offer: BookingOffer,
    totalCents: number,
    input: CreateBookingInput,
    schedule: BookingSchedule,
    expiresAt: Date,
    now: Date,
  ): Booking {
    return {
      id: this.ids.next(),
      offerSlug: offer.slug,
      offerTitle: offer.title,
      totalCents,
      depositCents: calculateDeposit(totalCents, offer.depositPercent),
      currency: 'ARS',
      paymentPlan: input.paymentPlan,
      schedule,
      calendarEventId: null,
      customer: { name: input.name, email: input.email, phone: input.phone },
      notes: input.notes,
      status: 'awaiting_payment',
      expiresAt,
      createdAt: now,
      updatedAt: now,
    };
  }

  private async checkoutAndPersist(booking: Booking): Promise<Outcome> {
    const gateway: PaymentGateway | undefined = this.gateways.find(this.gateways.defaultProvider);
    if (!gateway) {
      return fail('gateway_unavailable');
    }
    let payment: Payment;
    try {
      payment = await openCheckout(gateway, this.config, booking, this.ids.next(), booking.createdAt);
    } catch (error) {
      this.reporter.report(toError(error));
      return fail('gateway_unavailable');
    }
    await this.bookings.create(booking);
    await this.payments.create(payment);
    return ok({ bookingId: booking.id, checkoutUrl: payment.checkoutUrl });
  }
}
