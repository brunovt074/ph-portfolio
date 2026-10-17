import type { Booking } from '@/domain/booking/Booking';
import { BookingNotificationError } from '@/domain/booking/BookingNotificationError';
import type { BookingNotifier } from '@/domain/booking/BookingNotifier';
import type { Payment } from '@/domain/payment/Payment';
import type { BookingEmails } from './BookingEmails';
import { formatDuplicatePaymentEmail } from './formatDuplicatePaymentEmail';
import { formatBookingEmails } from './formatBookingEmails';
import { formatSlotConflictEmails } from './formatSlotConflictEmails';
import { formatRefundedPaymentEmail } from './formatRefundedPaymentEmail';
import type { FormattedEmail } from './FormattedEmail';
import type { ResendEmailClient } from './ResendEmailClient';

export class ResendBookingNotifier implements BookingNotifier {
  constructor(
    private readonly client: ResendEmailClient,
    private readonly studioEmail: string,
    private readonly fromEmail: string,
    private readonly timeZone: string,
  ) {}

  async paymentConfirmed(booking: Booking): Promise<void> {
    await this.deliver(booking, formatBookingEmails(booking, this.timeZone));
  }

  async slotConflict(booking: Booking): Promise<void> {
    await this.deliver(booking, formatSlotConflictEmails(booking, this.timeZone));
  }

  async duplicatePayment(booking: Booking, payment: Payment): Promise<void> {
    await this.alertStudio(booking, formatDuplicatePaymentEmail(booking, payment));
  }

  async paymentRefunded(booking: Booking, payment: Payment): Promise<void> {
    await this.alertStudio(booking, formatRefundedPaymentEmail(booking, payment));
  }

  private async alertStudio(booking: Booking, email: FormattedEmail): Promise<void> {
    const { error } = await this.client.emails.send({ from: this.fromEmail, to: this.studioEmail, replyTo: booking.customer.email, ...email });
    if (error) {
      throw new BookingNotificationError(error.message);
    }
  }

  private async deliver(booking: Booking, { toStudio, toCustomer }: BookingEmails): Promise<void> {
    const results = await Promise.all([
      this.client.emails.send({ from: this.fromEmail, to: this.studioEmail, replyTo: booking.customer.email, ...toStudio }),
      this.client.emails.send({ from: this.fromEmail, to: booking.customer.email, replyTo: this.studioEmail, ...toCustomer }),
    ]);
    const error = results.map((result) => result.error).find((candidate) => candidate !== null);
    if (error) {
      throw new BookingNotificationError(error.message);
    }
  }
}
