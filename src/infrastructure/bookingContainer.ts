import {
  BOOKING_DEMO,
  CONTACT_DELIVERY_MODE,
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  DATABASE_URL,
  MERCADOPAGO_ACCESS_TOKEN,
  MERCADOPAGO_WEBHOOK_SECRET,
  PAYMENT_PROVIDER,
  PGLITE_DIR,
  RESEND_API_KEY,
  SITE_URL,
} from 'astro:env/server';
import type { BookingConfig } from '@/application/booking/BookingConfig';
import { CreateBooking } from '@/application/booking/CreateBooking';
import { GetBookingStatus } from '@/application/booking/GetBookingStatus';
import { ListAvailableSlots } from '@/application/booking/ListAvailableSlots';
import { ProcessPaymentNotification } from '@/application/booking/ProcessPaymentNotification';
import { ReconcileBookingReturn } from '@/application/booking/ReconcileBookingReturn';
import { RetryDepositCheckout } from '@/application/booking/RetryDepositCheckout';
import { SlotAvailability } from '@/application/scheduling/SlotAvailability';
import type { BookingServices } from './BookingServices';
import { bookingTimeZone, getBookingCatalog } from './getBookingCatalog';
import { createDatabase } from './db/createDatabase';
import { DrizzleBookingRepository } from './db/DrizzleBookingRepository';
import { DrizzlePaymentRepository } from './db/DrizzlePaymentRepository';
import { createBookingNotifier } from './email/createBookingNotifier';
import { createPaymentGateways } from './payments/createPaymentGateways';
import { localSiteUrl } from './payments/localSiteUrl';
import { ConsoleErrorReporter } from './reporting/ConsoleErrorReporter';
import { InProcessBookingLock } from './scheduling/InProcessBookingLock';
import { SystemClock } from './SystemClock';
import { UuidGenerator } from './UuidGenerator';

const configuredSiteUrl = SITE_URL ? SITE_URL.replace(/\/+$/, '') : undefined;
const siteUrl = configuredSiteUrl ?? localSiteUrl;

const bookingConfig: BookingConfig = {
  siteUrl,
  holdHours: 48,
  minLeadDays: 2,
  maxLeadDays: 365,
  timeZone: bookingTimeZone,
};

const buildServices = async (): Promise<BookingServices> => {
  const database = await createDatabase({ databaseUrl: DATABASE_URL, pgliteDir: PGLITE_DIR });
  const catalog = getBookingCatalog();
  const { content, calendar, listBookingOffers } = catalog;
  const bookings = new DrizzleBookingRepository(database);
  const payments = new DrizzlePaymentRepository(database);
  const { gateways, simulated } = createPaymentGateways({
    provider: PAYMENT_PROVIDER,
    mercadoPagoAccessToken: MERCADOPAGO_ACCESS_TOKEN,
    mercadoPagoWebhookSecret: MERCADOPAGO_WEBHOOK_SECRET,
    siteUrl: configuredSiteUrl,
    bookingDemo: BOOKING_DEMO === 'true',
  });
  const notifier = createBookingNotifier({
    apiKey: RESEND_API_KEY,
    toEmail: CONTACT_TO_EMAIL,
    fromEmail: CONTACT_FROM_EMAIL,
    consoleDelivery: import.meta.env.DEV || CONTACT_DELIVERY_MODE === 'console',
    timeZone: bookingTimeZone,
  });
  const availability = new SlotAvailability(bookings, calendar);
  const lock = new InProcessBookingLock();
  const reporter = new ConsoleErrorReporter();
  const clock = new SystemClock();
  const ids = new UuidGenerator();
  const processPaymentNotification = new ProcessPaymentNotification(bookings, payments, gateways, notifier, reporter, content, availability, calendar, lock, clock);
  return {
    listBookingOffers,
    listAvailableSlots: new ListAvailableSlots(content, availability, calendar, clock, reporter),
    createBooking: new CreateBooking(content, bookings, payments, gateways, clock, ids, reporter, bookingConfig, availability, calendar, lock),
    processPaymentNotification,
    reconcileBookingReturn: new ReconcileBookingReturn(bookings, payments, gateways, processPaymentNotification, reporter),
    getBookingStatus: new GetBookingStatus(bookings, payments, clock),
    retryDepositCheckout: new RetryDepositCheckout(bookings, payments, gateways, clock, ids, reporter, bookingConfig),
    simulatedGateway: simulated,
    demoPricing: catalog.demoPricing,
    timeZone: bookingTimeZone,
  };
};

const globalForServices = globalThis as typeof globalThis & { __bookingServices?: Promise<BookingServices> };

export const getBookingServices = (): Promise<BookingServices> => {
  if (!globalForServices.__bookingServices) {
    const pending = buildServices();
    globalForServices.__bookingServices = pending;
    pending.catch(() => {
      if (globalForServices.__bookingServices === pending) {
        delete globalForServices.__bookingServices;
      }
    });
  }
  return globalForServices.__bookingServices;
};
