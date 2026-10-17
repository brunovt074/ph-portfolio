import type { Booking } from '@/domain/booking/Booking';
import type { Payment } from '@/domain/payment/Payment';
import type { PaymentGateway } from '@/domain/payment/PaymentGateway';
import { amountDueNow } from './amountDueNow';
import type { BookingConfig } from './BookingConfig';
import { checkoutTitle } from './checkoutTitle';

export const openCheckout = async (
  gateway: PaymentGateway,
  config: BookingConfig,
  booking: Booking,
  paymentId: string,
  now: Date,
): Promise<Payment> => {
  const amountCents = amountDueNow(booking);
  const holdsSlot = booking.schedule.kind === 'slot';
  const checkout = await gateway.createCheckout({
    reference: paymentId,
    title: checkoutTitle(booking),
    amountCents,
    currency: booking.currency,
    payerName: booking.customer.name,
    payerEmail: booking.customer.email,
    returnUrl: `${config.siteUrl}/reservas/${booking.id}`,
    notificationUrl: `${config.siteUrl}/api/payments/webhook/${gateway.provider}`,
    ...(holdsSlot ? { expiresAt: booking.expiresAt, instantMethodsOnly: true } : {}),
  });
  return {
    id: paymentId,
    bookingId: booking.id,
    kind: booking.paymentPlan,
    provider: gateway.provider,
    checkoutId: checkout.checkoutId,
    checkoutUrl: checkout.checkoutUrl,
    externalPaymentId: null,
    status: 'pending',
    amountCents,
    currency: booking.currency,
    raw: {},
    createdAt: now,
    updatedAt: now,
  };
};
