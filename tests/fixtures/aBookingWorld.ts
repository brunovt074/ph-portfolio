import type { BookingConfig } from '@/application/booking/BookingConfig';
import { CreateBooking } from '@/application/booking/CreateBooking';
import { GetBookingStatus } from '@/application/booking/GetBookingStatus';
import { ProcessPaymentNotification } from '@/application/booking/ProcessPaymentNotification';
import { RetryDepositCheckout } from '@/application/booking/RetryDepositCheckout';
import { ListAvailableSlots } from '@/application/booking/ListAvailableSlots';
import { SlotAvailability } from '@/application/scheduling/SlotAvailability';
import type { BookingOffer } from '@/domain/booking/BookingOffer';
import type { BookingLock } from '@/domain/scheduling/BookingLock';
import type { SchedulingSettings } from '@/domain/scheduling/SchedulingSettings';
import { FakeCalendarProvider } from '../fakes/FakeCalendarProvider';
import { FakeContentRepository } from '../fakes/FakeContentRepository';
import { FakeErrorReporter } from '../fakes/FakeErrorReporter';
import { FakeGateways } from '../fakes/FakeGateways';
import { FakePaymentGateway } from '../fakes/FakePaymentGateway';
import { FixedClock } from '../fakes/FixedClock';
import { ImmediateBookingLock } from '../fakes/ImmediateBookingLock';
import { InMemoryBookingRepository } from '../fakes/InMemoryBookingRepository';
import { InMemoryPaymentRepository } from '../fakes/InMemoryPaymentRepository';
import { RecordingNotifier } from '../fakes/RecordingNotifier';
import { SequentialIds } from '../fakes/SequentialIds';
import { aBookingOffer } from './aBookingOffer';
import { aSchedulingSettings, tuesdayAndThursdayWindows } from './aSchedulingSettings';

export const bookingConfig: BookingConfig = {
  siteUrl: 'https://sarahmoreau.example',
  holdHours: 48,
  minLeadDays: 2,
  maxLeadDays: 365,
  timeZone: 'America/Argentina/Buenos_Aires',
};

export interface BookingWorldOptions {
  offers?: BookingOffer[];
  now?: Date;
  notifier?: RecordingNotifier;
  gateways?: FakePaymentGateway[];
  defaultProvider?: string;
  calendar?: FakeCalendarProvider | null;
  scheduling?: Partial<SchedulingSettings>;
}

export const aBookingWorld = (options: BookingWorldOptions = {}, realLock: BookingLock | null = null) => {
  const content = new FakeContentRepository({
    bookingOffers: options.offers ?? [aBookingOffer()],
    scheduling: aSchedulingSettings(options.scheduling),
  });
  const calendar = options.calendar ?? null;
  const immediateLock = new ImmediateBookingLock();
  const lock: BookingLock = realLock ?? immediateLock;
  const bookings = new InMemoryBookingRepository();
  const payments = new InMemoryPaymentRepository();
  const gateway = new FakePaymentGateway();
  const gateways = new FakeGateways(options.gateways ?? [gateway], options.defaultProvider);
  const clock = new FixedClock(options.now ?? new Date('2026-10-17T15:00:00Z'));
  const ids = new SequentialIds();
  const reporter = new FakeErrorReporter();
  const notifier = options.notifier ?? new RecordingNotifier();
  const availability = new SlotAvailability(bookings, calendar);
  return {
    content,
    bookings,
    payments,
    gateway,
    gateways,
    clock,
    ids,
    reporter,
    notifier,
    calendar,
    lock: immediateLock,
    availability,
    createBooking: new CreateBooking(content, bookings, payments, gateways, clock, ids, reporter, bookingConfig, availability, calendar, lock),
    listSlots: new ListAvailableSlots(content, availability, calendar, clock, reporter),
    processNotification: new ProcessPaymentNotification(bookings, payments, gateways, notifier, reporter, content, availability, calendar, lock, clock),
    getStatus: new GetBookingStatus(bookings, payments, clock),
    retryCheckout: new RetryDepositCheckout(bookings, payments, gateways, clock, ids, reporter, bookingConfig),
  };
};

export const aSlotWorld = (options: BookingWorldOptions = {}, realLock: BookingLock | null = null) =>
  aBookingWorld(
    {
      offers: [aBookingOffer({ durationMinutes: 90 })],
      calendar: new FakeCalendarProvider(),
      ...options,
      scheduling: { windows: tuesdayAndThursdayWindows(), ...options.scheduling },
    },
    realLock,
  );

export const THURSDAY_MORNING_SLOT = '2026-10-22T13:00:00.000Z';
