import {
  BOOKING_DEMO,
  CALENDAR_PROVIDER,
  GOOGLE_CALENDAR_ID,
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
  MERCADOPAGO_ACCESS_TOKEN,
  PAYMENT_PROVIDER,
} from 'astro:env/server';
import demoData from '../../assets/booking-demo.json';
import { ListBookingOffers } from '@/application/booking/ListBookingOffers';
import type { ContentRepository } from '@/domain/ContentRepository';
import type { BookingCatalog } from './BookingCatalog';
import { contentRepository } from './container';
import { createCalendarProvider } from './scheduling/createCalendarProvider';
import { SimulatedCalendarProvider } from './scheduling/simulated/SimulatedCalendarProvider';
import { DemoBookingContentRepository } from './seed/DemoBookingContentRepository';

export const bookingTimeZone = 'America/Argentina/Buenos_Aires';

const buildCatalog = (): BookingCatalog => {
  const demoPricing = BOOKING_DEMO === 'true';
  const localReservations = !MERCADOPAGO_ACCESS_TOKEN && PAYMENT_PROVIDER !== 'simulado';
  const content: ContentRepository = demoPricing ? new DemoBookingContentRepository(contentRepository, demoData) : contentRepository;
  const calendar = localReservations
    ? new SimulatedCalendarProvider()
    : createCalendarProvider({
        provider: CALENDAR_PROVIDER,
        calendarId: GOOGLE_CALENDAR_ID,
        serviceAccountEmail: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        serviceAccountPrivateKey: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
        timeZone: bookingTimeZone,
      });
  return { content, calendar, listBookingOffers: new ListBookingOffers(content, calendar), demoPricing, localReservations, timeZone: bookingTimeZone };
};

const globalForCatalog = globalThis as typeof globalThis & { __bookingCatalog?: BookingCatalog };

export const getBookingCatalog = (): BookingCatalog => {
  globalForCatalog.__bookingCatalog ??= buildCatalog();
  return globalForCatalog.__bookingCatalog;
};
