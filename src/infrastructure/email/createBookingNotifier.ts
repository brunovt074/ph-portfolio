import { Resend } from 'resend';
import type { BookingNotifier } from '@/domain/booking/BookingNotifier';
import type { BookingNotifierConfig } from './BookingNotifierConfig';
import { ConsoleBookingNotifier } from './ConsoleBookingNotifier';
import { ResendBookingNotifier } from './ResendBookingNotifier';
import { UnavailableBookingNotifier } from './UnavailableBookingNotifier';

export const createBookingNotifier = ({ apiKey, toEmail, fromEmail, consoleDelivery, timeZone }: BookingNotifierConfig): BookingNotifier => {
  if (apiKey && toEmail && fromEmail) {
    return new ResendBookingNotifier(new Resend(apiKey), toEmail, fromEmail, timeZone);
  }
  if (consoleDelivery) {
    return new ConsoleBookingNotifier();
  }
  return new UnavailableBookingNotifier();
};
