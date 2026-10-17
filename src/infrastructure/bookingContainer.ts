import {
  BOOKING_DEMO,
  CALENDAR_PROVIDER,
  CONTACT_DELIVERY_MODE,
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  DATABASE_URL,
  GOOGLE_CALENDAR_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_WEBHOOK_SECRET,
  PAYMENT_PROVIDER,
  PGLITE_DIR,
  RESEND_API_KEY,
  SITE_URL,
} from 'astro:env/server';
import demoData from '../../assets/booking-demo.json';
import type { BookingConfig } from '@/application/booking/BookingConfig';
import { CreateBooking } from '@/application/booking/CreateBooking';
import { GetBookingStatus } from '@/application/booking/GetBookingStatus';
import { ListAvailableSlots } from '@/application/booking/ListAvailableSlots';
import { ListBookingOffers } from '@/application/booking/ListBookingOffers';
import { ProcessPaymentNotification } from '@/application/booking/ProcessPaymentNotification';
import { RetryDepositCheckout } from '@/application/booking/RetryDepositCheckout';
import { SlotAvailability } from '@/application/scheduling/SlotAvailability';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { BookingServices } from './BookingServices';
import { contentRepository } from './container';
import { createDatabase } from './db/createDatabase';
import { DrizzleBookingRepository } from './db/DrizzleBookingRepository';
import { DrizzlePaymentRepository } from './db/DrizzlePaymentRepository';
import { createBookingNotifier } from './email/createBookingNotifier';
import { createPaymentGateways } from './payments/createPaymentGateways';
import { ConsoleErrorReporter } from './reporting/ConsoleErrorReporter';
import { createCalendarProvider } from './scheduling/createCalendarProvider';
import { InProcessBookingLock } from './scheduling/InProcessBookingLock';
import { DemoBookingContentRepository } from './seed/DemoBookingContentRepository';
import { SystemClock } from './SystemClock';
import { UuidGenerator } from './UuidGenerator';

const siteUrl = (SITE_URL ?? 'http://localhost:4321').replace(/\/+$/, '');

const timeZone = 'America/Argentina/Buenos_Aires';

const bookingConfig: BookingConfig = {
  siteUrl,
  holdHours: 48,
  minLeadDays: 2,
  maxLeadDays: 365,
  timeZone,
};

const buildServices = async (): Promise<BookingServices> => {
  const database = await createDatabase({ databaseUrl: DATABASE_URL, pgliteDir: PGLITE_DIR });
  const content: ContentRepository =
    BOOKING_DEMO === 'true' ? new DemoBookingContentRepository(contentRepository, demoData) : contentRepository;
  const bookings = new DrizzleBookingRepository(database);
  const payments = new DrizzlePaymentRepository(database);
  const { gateways, simulated } = createPaymentGateways({
    provider: PAYMENT_PROVIDER,
    mercadoPagoAccessToken: MERCADOPAGO_ACCESS_TOKEN,
    mercadoPagoWebhookSecret: MERCADOPAGO_WEBHOOK_SECRET,
    siteUrl,
  });
  const notifier = createBookingNotifier({
    apiKey: RESEND_API_KEY,
    toEmail: CONTACT_TO_EMAIL,
    fromEmail: CONTACT_FROM_EMAIL,
    consoleDelivery: import.meta.env.DEV || CONTACT_DELIVERY_MODE === 'console',
    timeZone,
  });
  const calendar = createCalendarProvider({
    provider: CALENDAR_PROVIDER,
    calendarId: GOOGLE_CALENDAR_ID,
    serviceAccountEmail: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    serviceAccountPrivateKey: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
    timeZone,
  });
  const availability = new SlotAvailability(bookings, calendar);
  const lock = new InProcessBookingLock();
  const reporter = new ConsoleErrorReporter();
  const clock = new SystemClock();
  const ids = new UuidGenerator();
  return {
    listBookingOffers: new ListBookingOffers(content),
    listAvailableSlots: new ListAvailableSlots(content, availability, calendar, clock, reporter),
    createBooking: new CreateBooking(content, bookings, payments, gateways, clock, ids, reporter, bookingConfig, availability, calendar, lock),
    processPaymentNotification: new ProcessPaymentNotification(bookings, payments, gateways, notifier, reporter, content, availability, calendar, lock, clock),
    getBookingStatus: new GetBookingStatus(bookings, payments, clock),
    retryDepositCheckout: new RetryDepositCheckout(bookings, payments, gateways, clock, ids, reporter, bookingConfig),
    simulatedGateway: simulated,
  };
};

const globalForServices = globalThis as typeof globalThis & { __bookingServices?: Promise<BookingServices> };

export const getBookingServices = (): Promise<BookingServices> => {
  globalForServices.__bookingServices ??= buildServices();
  return globalForServices.__bookingServices;
};
