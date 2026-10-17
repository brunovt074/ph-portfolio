import type { Booking } from '@/domain/booking/Booking';
import type { Payment } from '@/domain/payment/Payment';
import type { FormattedEmail } from './FormattedEmail';
import { formatMoney } from './formatMoney';
import { singleLine } from './singleLine';

export const formatRefundedPaymentEmail = (booking: Booking, payment: Payment): FormattedEmail => ({
  subject: `Pago devuelto: ${singleLine(booking.customer.name)} (${formatMoney(payment.amountCents)})`,
  text: `Se devolvió el pago de la reserva ${booking.id} de ${booking.customer.name}. Si corresponde, liberá el turno en tu calendario.`,
});
